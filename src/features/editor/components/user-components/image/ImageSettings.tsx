import { useRef, useState } from 'react'
import { useNode } from '@craftjs/core'
import { Sparkles, Loader2, Upload } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { generateImage, uploadGeneratedImage, uploadEditorImage, type ImageSize } from '@/features/editor/api/generate-image-api'

const SIZE_OPTIONS: { label: string; value: ImageSize }[] = [
  { label: 'Quadrada', value: '1024x1024' },
  { label: 'Retrato', value: '1024x1792' },
  { label: 'Paisagem', value: '1792x1024' },
]

export const ImageSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }))
  const { session } = useAuth()
  const userId = session?.user?.id

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const [prompt, setPrompt] = useState('')
  const [size, setSize] = useState<ImageSize>('1024x1024')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    setIsUploading(true)
    setUploadError('')
    try {
      const publicUrl = await uploadEditorImage(userId, file)
      setProp((p: Record<string, unknown>) => { p.src = publicUrl })
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Erro ao enviar imagem')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleGenerate() {
    if (!prompt.trim() || !userId) return
    setIsGenerating(true)
    setError('')
    try {
      const { imageUrl } = await generateImage({ prompt: prompt.trim(), size })
      const publicUrl = await uploadGeneratedImage(userId, imageUrl)
      setProp((p: Record<string, unknown>) => {
        p.src = publicUrl
        p.alt = prompt.trim()
      })
      setPrompt('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar imagem')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload de arquivo */}
      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2 flex items-center gap-1">
          <Upload className="h-3 w-3" />
          Enviar Imagem
        </h4>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || !userId}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="h-3.5 w-3.5" />
              Escolher arquivo
            </>
          )}
        </button>
        <p className="text-xs text-gray-400 mt-1">JPG, PNG ou WebP. Máx 5MB.</p>
        {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Imagem</h4>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-400">URL da Imagem</label>
            <input
              type="text"
              value={props.src || ''}
              placeholder="https://..."
              onChange={(e) => setProp((p: Record<string, unknown>) => { p.src = e.target.value })}
              className="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-gray-50"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Texto Alternativo</label>
            <input
              type="text"
              value={props.alt || ''}
              onChange={(e) => setProp((p: Record<string, unknown>) => { p.alt = e.target.value })}
              className="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* Gerar com IA */}
      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2 flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          Gerar com IA
        </h4>
        <div className="space-y-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Descreva a imagem que deseja gerar..."
            rows={3}
            maxLength={1000}
            disabled={isGenerating}
            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded bg-gray-50 resize-none focus:border-blue-400 focus:outline-none"
          />
          <div className="flex gap-1">
            {SIZE_OPTIONS.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => setSize(value)}
                disabled={isGenerating}
                className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                  size === value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim() || !userId}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Gerar Imagem
              </>
            )}
          </button>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Dimensoes</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-400">Largura</label>
            <input
              type="text"
              value={props.width || '100%'}
              onChange={(e) => setProp((p: Record<string, unknown>) => { p.width = e.target.value })}
              className="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-gray-50"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Altura</label>
            <input
              type="text"
              value={props.height || 'auto'}
              onChange={(e) => setProp((p: Record<string, unknown>) => { p.height = e.target.value })}
              className="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-gray-50"
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Ajuste</h4>
        <div className="flex gap-1">
          {(['cover', 'contain', 'fill'] as const).map((fit) => (
            <button
              key={fit}
              onClick={() => setProp((p: Record<string, unknown>) => { p.objectFit = fit })}
              className={`px-3 py-1 text-xs rounded capitalize ${
                props.objectFit === fit
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {fit}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Fundo</h4>
        <div className="flex gap-1">
          {([
            { label: 'Nenhum', value: 'transparent' },
            { label: 'Branco', value: '#ffffff' },
            { label: 'Preto', value: '#000000' },
          ]).map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setProp((p: Record<string, unknown>) => { p.backgroundColor = value })}
              className={`px-3 py-1 text-xs rounded ${
                (props.backgroundColor || 'transparent') === value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Border Radius</h4>
        <input
          type="range"
          min={0}
          max={50}
          value={props.borderRadius || 0}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.borderRadius = parseInt(e.target.value) }, 500)}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.borderRadius}px</span>
      </div>
    </div>
  )
}
