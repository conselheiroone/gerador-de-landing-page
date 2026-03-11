import { useState, useRef, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Palette, Upload } from 'lucide-react'
import { slideUp } from '@/lib/motion-variants'
import { Button } from '@/components/ui/button'
import { extractColorsFromFile } from '@/utils/extract-colors'
import { uploadLogo } from '../../api/onboarding'
import type { PerfilEmpresa } from '../../types/onboarding.types'
import type { IdentidadeVisualInput } from '../../schemas/onboarding.schemas'

interface IdentidadeVisualStepProps {
  perfil: PerfilEmpresa
  userId: string
  onSave: (dados: IdentidadeVisualInput) => Promise<void>
  onBack: () => void
  isSaving: boolean
}

export function IdentidadeVisualStep({ perfil, userId, onSave, onBack, isSaving }: IdentidadeVisualStepProps) {
  const [logoUrl, setLogoUrl] = useState(perfil.logo_url ?? '')
  const [corPrimaria, setCorPrimaria] = useState(perfil.cor_primaria || '#10B981')
  const [corSecundaria, setCorSecundaria] = useState(perfil.cor_secundaria || '#1A1A1A')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    try {
      const [url, colors] = await Promise.all([
        uploadLogo(userId, file),
        extractColorsFromFile(file),
      ])
      setLogoUrl(url)
      if (colors) {
        setCorPrimaria(colors.primary)
        setCorSecundaria(colors.secondary)
      }
    } catch {
      setError('Erro ao fazer upload da logo')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await onSave({
      logo_url: logoUrl,
      cor_primaria: corPrimaria,
      cor_secundaria: corSecundaria,
    })
  }

  return (
    <motion.div variants={slideUp} initial="hidden" animate="visible">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
          <Palette className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Identidade Visual</h2>
          <p className="text-sm text-gray-500">Logo e cores que representam sua marca</p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Logo da Empresa</label>
          <div className="flex items-center gap-4">
            {logoUrl ? (
              <div className="relative">
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="h-24 w-24 rounded-xl border border-gray-200 object-contain p-2"
                />
              </div>
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
                <Upload className="h-8 w-8 text-gray-300" />
              </div>
            )}
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                isLoading={uploading}
              >
                {logoUrl ? 'Trocar logo' : 'Enviar logo'}
              </Button>
              <p className="text-xs text-gray-400">PNG, JPG, SVG ou WebP. Max 2MB.</p>
            </div>
          </div>
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>

        {/* Cores */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Cores da Marca</label>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
              <input
                type="color"
                value={corPrimaria}
                onChange={(e) => setCorPrimaria(e.target.value)}
                className="h-10 w-10 cursor-pointer rounded border-0 bg-transparent"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">Cor Primária</p>
                <p className="text-xs text-gray-500 uppercase">{corPrimaria}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
              <input
                type="color"
                value={corSecundaria}
                onChange={(e) => setCorSecundaria(e.target.value)}
                className="h-10 w-10 cursor-pointer rounded border-0 bg-transparent"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">Cor Secundária</p>
                <p className="text-xs text-gray-500 uppercase">{corSecundaria}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Preview</label>
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img src={logoUrl} alt="" className="h-10 w-10 object-contain" />
              ) : (
                <div className="h-10 w-10 rounded bg-gray-100" />
              )}
              <span className="font-semibold" style={{ color: corPrimaria }}>
                {perfil.nome_empresa || 'Nome do Escritório'}
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              <div
                className="rounded px-3 py-1.5 text-xs font-medium text-white"
                style={{ backgroundColor: corPrimaria }}
              >
                Botão Primário
              </div>
              <div
                className="rounded px-3 py-1.5 text-xs font-medium text-white"
                style={{ backgroundColor: corSecundaria }}
              >
                Botão Secundário
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="ghost" onClick={onBack}>
            Voltar
          </Button>
          <Button type="submit" isLoading={isSaving}>
            Próximo
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
