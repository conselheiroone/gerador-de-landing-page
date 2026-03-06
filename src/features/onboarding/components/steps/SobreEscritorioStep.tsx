import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Plus, X, Star } from 'lucide-react'
import { slideUp } from '@/lib/motion-variants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { PerfilEmpresa } from '../../types/onboarding.types'
import type { SobreEscritorioInput } from '../../schemas/onboarding.schemas'

interface SobreEscritorioStepProps {
  perfil: PerfilEmpresa
  onSave: (dados: SobreEscritorioInput) => Promise<void>
  onBack: () => void
  isSaving: boolean
}

export function SobreEscritorioStep({ perfil, onSave, onBack, isSaving }: SobreEscritorioStepProps) {
  const [form, setForm] = useState({
    historia: perfil.historia ?? '',
    missao: perfil.missao ?? '',
    visao: perfil.visao ?? '',
    valores: perfil.valores ?? '',
  })
  const [diferenciais, setDiferenciais] = useState<string[]>(perfil.diferenciais ?? [])
  const [googlePlaceId, setGooglePlaceId] = useState(perfil.google_place_id ?? '')
  const [novoDiferencial, setNovoDiferencial] = useState('')

  function handleChange(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function adicionarDiferencial() {
    const trimmed = novoDiferencial.trim()
    if (trimmed && !diferenciais.includes(trimmed)) {
      setDiferenciais(prev => [...prev, trimmed])
      setNovoDiferencial('')
    }
  }

  function removerDiferencial(index: number) {
    setDiferenciais(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await onSave({
      ...form,
      diferenciais,
      google_place_id: googlePlaceId,
    })
  }

  return (
    <motion.div variants={slideUp} initial="hidden" animate="visible">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Sobre o Escritório</h2>
          <p className="text-sm text-gray-500">Conte a história e os valores da empresa</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Nossa História</label>
          <Textarea
            placeholder="Conte um pouco sobre a trajetória do seu escritório, como começou e como cresceu ao longo dos anos..."
            value={form.historia}
            onChange={(e) => handleChange('historia', e.target.value)}
            rows={4}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Missão</label>
            <Textarea
              placeholder="Qual é a missão do escritório?"
              value={form.missao}
              onChange={(e) => handleChange('missao', e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Visão</label>
            <Textarea
              placeholder="Onde o escritório quer chegar?"
              value={form.visao}
              onChange={(e) => handleChange('visao', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Valores</label>
          <Textarea
            placeholder="Quais valores guiam o trabalho do escritório? Ex: Ética, Transparência, Compromisso..."
            value={form.valores}
            onChange={(e) => handleChange('valores', e.target.value)}
            rows={2}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Diferenciais</label>
          <p className="mb-2 text-xs text-gray-400">
            O que faz o escritório se destacar dos concorrentes?
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            {diferenciais.map((d, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
              >
                {d}
                <button
                  type="button"
                  onClick={() => removerDiferencial(i)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-brand-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Ex: Atendimento personalizado"
              value={novoDiferencial}
              onChange={(e) => setNovoDiferencial(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  adicionarDiferencial()
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={adicionarDiferencial}
              disabled={!novoDiferencial.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Google Place ID — opcional, para importar avaliações depois */}
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Star className="h-4 w-4 text-yellow-500" />
            Avaliações do Google (opcional)
          </div>
          <p className="text-xs text-gray-500">
            Cole o Google Place ID do seu escritório para importar avaliações reais na landing page.
            Encontre em: <span className="font-medium text-gray-600">Google Maps → seu negócio → Compartilhar → ID do local</span>
          </p>
          <Input
            placeholder="Ex: ChIJN1t_tDeuEmsRUsoyG83frY4"
            value={googlePlaceId}
            onChange={(e) => setGooglePlaceId(e.target.value)}
          />
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
