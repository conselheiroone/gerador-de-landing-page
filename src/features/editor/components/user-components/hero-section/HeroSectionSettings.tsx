import { useState } from 'react'
import { useNode } from '@craftjs/core'
import { Sparkles, Loader2 } from 'lucide-react'
import { ColorInput } from '../../ColorInput'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { generateImage, uploadGeneratedImage } from '@/features/editor/api/generate-image-api'

export const HeroSectionSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }))
  const { session } = useAuth()
  const userId = session?.user?.id

  const [aiPrompt, setAiPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiError, setAiError] = useState('')

  async function handleGenerateHeroImage() {
    if (!aiPrompt.trim() || !userId) return
    setIsGenerating(true)
    setAiError('')
    try {
      const { imageUrl } = await generateImage({ prompt: aiPrompt.trim(), size: '1792x1024' })
      const publicUrl = await uploadGeneratedImage(userId, imageUrl)
      setProp((p: Record<string, unknown>) => {
        p.backgroundImage = publicUrl
        if (!p.overlayOpacity || (p.overlayOpacity as number) < 0.3) p.overlayOpacity = 0.55
      })
      setAiPrompt('')
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Erro ao gerar imagem')
    } finally {
      setIsGenerating(false)
    }
  }

  const hasGradient = props.gradientFrom && props.gradientTo

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Fundo</h4>
        <ColorInput
          value={props.background || '#0f172a'}
          onChange={(v) => setProp((p: Record<string, unknown>) => { p.background = v })}
        />
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Gradiente</h4>
        <div className="space-y-2">
          <div>
            <span className="text-xs text-gray-400 mb-1 block">De:</span>
            <ColorInput
              value={props.gradientFrom || '#0f172a'}
              onChange={(v) => setProp((p: Record<string, unknown>) => { p.gradientFrom = v })}
            />
          </div>
          <div>
            <span className="text-xs text-gray-400 mb-1 block">Até:</span>
            <ColorInput
              value={props.gradientTo || '#1e293b'}
              onChange={(v) => setProp((p: Record<string, unknown>) => { p.gradientTo = v })}
            />
          </div>

          <div>
            <p className="text-[10px] text-gray-400 mb-1">Tipo</p>
            <div className="flex gap-1">
              {(['linear', 'radial'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setProp((p: Record<string, unknown>) => { p.gradientType = t })}
                  className={`px-3 py-1 text-xs rounded ${
                    (props.gradientType || 'linear') === t
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t === 'linear' ? 'Linear' : 'Radial'}
                </button>
              ))}
            </div>
          </div>

          {(props.gradientType || 'linear') === 'linear' ? (
            <select
              value={props.gradientDirection || '135deg'}
              onChange={(e) => setProp((p: Record<string, unknown>) => { p.gradientDirection = e.target.value })}
              className="w-full text-xs border border-gray-200 rounded px-2 py-1"
            >
              <option value="135deg">Diagonal ↘</option>
              <option value="to right">Horizontal →</option>
              <option value="to bottom">Vertical ↓</option>
              <option value="to bottom right">Para baixo-direita ↘</option>
              <option value="45deg">Diagonal ↗</option>
            </select>
          ) : (
            <select
              value={props.gradientDirection || 'circle at bottom right'}
              onChange={(e) => setProp((p: Record<string, unknown>) => { p.gradientDirection = e.target.value })}
              className="w-full text-xs border border-gray-200 rounded px-2 py-1"
            >
              <option value="circle at bottom right">Radial baixo-direita</option>
              <option value="circle at top right">Radial cima-direita</option>
              <option value="circle at center">Radial centro</option>
              <option value="ellipse at bottom right">Elipse baixo-direita</option>
              <option value="ellipse at center">Elipse centro</option>
            </select>
          )}

          {hasGradient && (
            <button
              onClick={() => setProp((p: Record<string, unknown>) => { p.gradientFrom = ''; p.gradientTo = '' })}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Remover gradiente
            </button>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Altura Mínima (px)</h4>
        <input
          type="range"
          min={100}
          max={700}
          value={props.minHeight || 200}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.minHeight = parseInt(e.target.value) }, 500)}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.minHeight || 200}px</span>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Padding Vertical (px)</h4>
        <input
          type="range"
          min={20}
          max={120}
          value={props.paddingY || 60}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.paddingY = parseInt(e.target.value) }, 500)}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.paddingY}px</span>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Alinhamento</h4>
        <div className="flex gap-1">
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              onClick={() => setProp((p: Record<string, unknown>) => { p.textAlign = align })}
              className={`px-3 py-1 text-xs rounded ${
                props.textAlign === align
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {align === 'left' ? 'Esquerda' : align === 'center' ? 'Centro' : 'Direita'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Imagem de Fundo</h4>
        <input
          type="text"
          placeholder="URL da imagem"
          value={props.backgroundImage || ''}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.backgroundImage = e.target.value })}
          className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 mb-2"
        />

        {/* Gerar com IA */}
        <div className="mb-2 space-y-1.5">
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Descreva a imagem de fundo..."
            rows={2}
            maxLength={1000}
            disabled={isGenerating}
            className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded bg-gray-50 resize-none focus:border-blue-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleGenerateHeroImage}
            disabled={isGenerating || !aiPrompt.trim() || !userId}
            className="w-full flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3" />
                Gerar com IA
              </>
            )}
          </button>
          {aiError && <p className="text-xs text-red-500">{aiError}</p>}
        </div>
        {props.backgroundImage && (
          <div className="space-y-2">
            <div>
              <span className="text-xs text-gray-400 mb-1 block">Opacidade do overlay</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round((props.overlayOpacity ?? 0) * 100)}
                onChange={(e) => setProp((p: Record<string, unknown>) => { p.overlayOpacity = parseInt(e.target.value) / 100 }, 500)}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{Math.round((props.overlayOpacity ?? 0) * 100)}%</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 mb-1 block">Cor do overlay</span>
              <ColorInput
                value={props.overlayColor || '#000000'}
                onChange={(v) => setProp((p: Record<string, unknown>) => { p.overlayColor = v })}
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={props.parallax ?? false}
                onChange={(e) => setProp((p: Record<string, unknown>) => { p.parallax = e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-xs text-gray-600">Parallax scrolling</span>
            </label>
            <button
              onClick={() => setProp((p: Record<string, unknown>) => { p.backgroundImage = ''; p.overlayOpacity = 0; p.parallax = false })}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Remover imagem
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
