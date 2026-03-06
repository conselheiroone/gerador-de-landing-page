import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Share2 } from 'lucide-react'
import { slideUp } from '@/lib/motion-variants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { PerfilEmpresa, RedesSociais } from '../../types/onboarding.types'
import type { RedesSociaisInput } from '../../schemas/onboarding.schemas'

interface RedesSociaisStepProps {
  perfil: PerfilEmpresa
  onSave: (dados: RedesSociaisInput) => Promise<void>
  onBack: () => void
  isSaving: boolean
}

const REDES = [
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/seuescritorio', icon: '📷' },
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/seuescritorio', icon: '👤' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/seuescritorio', icon: '💼' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@seuescritorio', icon: '▶️' },
  { key: 'site', label: 'Site', placeholder: 'https://www.seuescritorio.com.br', icon: '🌐' },
  { key: 'twitter', label: 'X (Twitter)', placeholder: 'https://x.com/seuescritorio', icon: '𝕏' },
] as const

export function RedesSociaisStep({ perfil, onSave, onBack, isSaving }: RedesSociaisStepProps) {
  const redesIniciais = (perfil.redes_sociais as RedesSociais | null) ?? {}
  const [form, setForm] = useState<RedesSociaisInput>({
    instagram: redesIniciais.instagram ?? '',
    facebook: redesIniciais.facebook ?? '',
    linkedin: redesIniciais.linkedin ?? '',
    youtube: redesIniciais.youtube ?? '',
    site: redesIniciais.site ?? '',
    twitter: redesIniciais.twitter ?? '',
  })

  function handleChange(field: keyof RedesSociaisInput, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await onSave(form)
  }

  return (
    <motion.div variants={slideUp} initial="hidden" animate="visible">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
          <Share2 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Redes Sociais</h2>
          <p className="text-sm text-gray-500">Links da presença online do escritório</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {REDES.map(rede => (
          <div key={rede.key}>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
              <span>{rede.icon}</span>
              {rede.label}
            </label>
            <Input
              placeholder={rede.placeholder}
              value={form[rede.key]}
              onChange={(e) => handleChange(rede.key, e.target.value)}
            />
          </div>
        ))}

        <p className="text-xs text-gray-400">
          Deixe em branco os campos que não se aplicam. Você pode editar depois.
        </p>

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
