import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Building2 } from 'lucide-react'
import { slideUp } from '@/lib/motion-variants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { dadosEscritorioSchema, type DadosEscritorioInput } from '../../schemas/onboarding.schemas'
import type { PerfilEmpresa } from '../../types/onboarding.types'

interface DadosEscritorioStepProps {
  perfil: PerfilEmpresa
  onSave: (dados: DadosEscritorioInput) => Promise<void>
  isSaving: boolean
}

export function DadosEscritorioStep({ perfil, onSave, isSaving }: DadosEscritorioStepProps) {
  const [form, setForm] = useState<DadosEscritorioInput>({
    nome_empresa: perfil.nome_empresa ?? '',
    cnpj: perfil.cnpj ?? '',
    tipo_escritorio: perfil.tipo_escritorio ?? 'individual',
    slogan: perfil.slogan ?? '',
    ano_fundacao: perfil.ano_fundacao?.toString() ?? '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function formatCnpj(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 14)
    return digits
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }

  function handleChange(field: keyof DadosEscritorioInput, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrors({})

    const result = dadosEscritorioSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string
        fieldErrors[field] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    await onSave(result.data)
  }

  return (
    <motion.div variants={slideUp} initial="hidden" animate="visible">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Dados do Escritório</h2>
          <p className="text-sm text-gray-500">Informações básicas da sua empresa</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Nome da Empresa *
          </label>
          <Input
            placeholder="Ex: Contabilidade Silva & Associados"
            value={form.nome_empresa}
            onChange={(e) => handleChange('nome_empresa', e.target.value)}
            error={errors.nome_empresa}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            CNPJ
          </label>
          <Input
            placeholder="00.000.000/0000-00"
            value={form.cnpj}
            onChange={(e) => handleChange('cnpj', formatCnpj(e.target.value))}
            error={errors.cnpj}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Tipo do Escritório *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleChange('tipo_escritorio', 'individual')}
              className={`rounded-lg border p-4 text-left transition-colors ${
                form.tipo_escritorio === 'individual'
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="text-sm font-medium">Individual</p>
              <p className="mt-0.5 text-xs text-gray-500">Contador único</p>
            </button>
            <button
              type="button"
              onClick={() => handleChange('tipo_escritorio', 'sociedade')}
              className={`rounded-lg border p-4 text-left transition-colors ${
                form.tipo_escritorio === 'sociedade'
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="text-sm font-medium">Sociedade</p>
              <p className="mt-0.5 text-xs text-gray-500">Múltiplos sócios</p>
            </button>
          </div>
          {errors.tipo_escritorio && (
            <p className="mt-1 text-xs text-red-500">{errors.tipo_escritorio}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Slogan
          </label>
          <Input
            placeholder="Ex: Contabilidade que transforma negócios"
            value={form.slogan}
            onChange={(e) => handleChange('slogan', e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Ano de Fundação
          </label>
          <Input
            type="number"
            placeholder="Ex: 2010"
            min="1900"
            max={new Date().getFullYear()}
            value={form.ano_fundacao}
            onChange={(e) => handleChange('ano_fundacao', e.target.value)}
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" isLoading={isSaving}>
            Próximo
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
