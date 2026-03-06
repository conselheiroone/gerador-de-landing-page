import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Search } from 'lucide-react'
import { slideUp } from '@/lib/motion-variants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { contatoLocalizacaoSchema, type ContatoLocalizacaoInput } from '../../schemas/onboarding.schemas'
import { buscarCep } from '../../api/onboarding'
import { ESTADOS_BRASILEIROS, type PerfilEmpresa } from '../../types/onboarding.types'
import { HorarioSelector } from '../HorarioSelector'

interface ContatoLocalizacaoStepProps {
  perfil: PerfilEmpresa
  onSave: (dados: ContatoLocalizacaoInput) => Promise<void>
  onBack: () => void
  isSaving: boolean
}

export function ContatoLocalizacaoStep({ perfil, onSave, onBack, isSaving }: ContatoLocalizacaoStepProps) {
  const [form, setForm] = useState<ContatoLocalizacaoInput>({
    telefone: perfil.telefone ?? '',
    whatsapp: perfil.whatsapp ?? '',
    email_contato: perfil.email_contato ?? '',
    horario_atendimento: perfil.horario_atendimento ?? '',
    cep: perfil.cep ?? '',
    logradouro: perfil.logradouro ?? '',
    numero: perfil.numero ?? '',
    complemento: perfil.complemento ?? '',
    bairro: perfil.bairro ?? '',
    cidade: perfil.cidade ?? '',
    estado: perfil.estado ?? '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [buscandoCep, setBuscandoCep] = useState(false)

  function handleChange(field: keyof ContatoLocalizacaoInput, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 10) {
      return digits.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim()
    }
    return digits.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim()
  }

  function formatCep(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 8)
    return digits.replace(/^(\d{5})(\d)/, '$1-$2')
  }

  async function handleBuscarCep() {
    const cep = form.cep?.replace(/\D/g, '') ?? ''
    if (cep.length !== 8) return

    setBuscandoCep(true)
    try {
      const result = await buscarCep(cep)
      if (result) {
        setForm(prev => ({
          ...prev,
          logradouro: result.logradouro || prev.logradouro,
          bairro: result.bairro || prev.bairro,
          cidade: result.localidade || prev.cidade,
          estado: result.uf || prev.estado,
        }))
      }
    } finally {
      setBuscandoCep(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrors({})

    const result = contatoLocalizacaoSchema.safeParse(form)
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
          <MapPin className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Contato e Localização</h2>
          <p className="text-sm text-gray-500">Como seus clientes encontram o escritório</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Telefone</label>
            <Input
              placeholder="(11) 3000-0000"
              value={form.telefone}
              onChange={(e) => handleChange('telefone', formatPhone(e.target.value))}
              error={errors.telefone}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">WhatsApp</label>
            <Input
              placeholder="(11) 99000-0000"
              value={form.whatsapp}
              onChange={(e) => handleChange('whatsapp', formatPhone(e.target.value))}
              error={errors.whatsapp}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Email de Contato</label>
            <Input
              type="email"
              placeholder="contato@escritorio.com"
              value={form.email_contato}
              onChange={(e) => handleChange('email_contato', e.target.value)}
              error={errors.email_contato}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Horário de Atendimento
            </label>
            <HorarioSelector
              value={form.horario_atendimento ?? ''}
              onChange={(val) => handleChange('horario_atendimento', val)}
            />
          </div>
        </div>

        <hr className="my-2 border-gray-100" />

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">CEP</label>
            <Input
              placeholder="00000-000"
              value={form.cep}
              onChange={(e) => handleChange('cep', formatCep(e.target.value))}
              error={errors.cep}
            />
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleBuscarCep}
              isLoading={buscandoCep}
              disabled={!form.cep || form.cep.replace(/\D/g, '').length !== 8}
            >
              <Search className="h-4 w-4" />
              Buscar
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Logradouro</label>
            <Input
              placeholder="Rua, Avenida..."
              value={form.logradouro}
              onChange={(e) => handleChange('logradouro', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Número</label>
            <Input
              placeholder="123"
              value={form.numero}
              onChange={(e) => handleChange('numero', e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Complemento</label>
            <Input
              placeholder="Sala, Andar..."
              value={form.complemento}
              onChange={(e) => handleChange('complemento', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Bairro</label>
            <Input
              placeholder="Bairro"
              value={form.bairro}
              onChange={(e) => handleChange('bairro', e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Cidade</label>
            <Input
              placeholder="Cidade"
              value={form.cidade}
              onChange={(e) => handleChange('cidade', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Estado</label>
            <select
              value={form.estado}
              onChange={(e) => handleChange('estado', e.target.value)}
              className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
            >
              <option value="">Selecione...</option>
              {ESTADOS_BRASILEIROS.map(uf => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
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
