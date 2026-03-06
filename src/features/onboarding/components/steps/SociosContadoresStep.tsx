import { useState, useRef, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Plus, Trash2, Upload, ChevronDown, ChevronUp } from 'lucide-react'
import { slideUp } from '@/lib/motion-variants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { uploadFotoSocio } from '../../api/onboarding'
import type { Socio } from '../../types/onboarding.types'
import {
  ESPECIALIDADES_CONTABEIS,
  CARGOS_ESCRITORIO,
  ESTADOS_BRASILEIROS,
} from '../../types/onboarding.types'

interface SociosContadoresStepProps {
  perfilId: string
  userId: string
  sociosIniciais: Socio[]
  onSave: (socios: Array<Omit<Socio, 'created_at' | 'updated_at' | 'perfil_empresa_id'>>) => Promise<void>
  onBack: () => void
  isSaving: boolean
}

interface SocioForm {
  id: string
  nome_completo: string
  crc_numero: string
  crc_estado: string
  cargo: string
  foto_url: string
  especialidades: string[]
  mini_bio: string
  exibir_landing_page: boolean
  ordem: number
  expanded: boolean
}

function criarSocioVazio(ordem: number): SocioForm {
  return {
    id: '',
    nome_completo: '',
    crc_numero: '',
    crc_estado: '',
    cargo: '',
    foto_url: '',
    especialidades: [],
    mini_bio: '',
    exibir_landing_page: true,
    ordem,
    expanded: true,
  }
}

export function SociosContadoresStep({
  userId,
  sociosIniciais,
  onSave,
  onBack,
  isSaving,
}: SociosContadoresStepProps) {
  const [socios, setSocios] = useState<SocioForm[]>(() => {
    if (sociosIniciais.length > 0) {
      return sociosIniciais.map((s, i) => ({
        id: s.id,
        nome_completo: s.nome_completo,
        crc_numero: s.crc_numero ?? '',
        crc_estado: s.crc_estado ?? '',
        cargo: s.cargo ?? '',
        foto_url: s.foto_url ?? '',
        especialidades: s.especialidades ?? [],
        mini_bio: s.mini_bio ?? '',
        exibir_landing_page: s.exibir_landing_page,
        ordem: s.ordem,
        expanded: i === 0,
      }))
    }
    return [criarSocioVazio(0)]
  })

  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadTargetIndex = useRef<number>(0)

  function updateSocio(index: number, field: keyof SocioForm, value: unknown) {
    setSocios(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
    setErrors(prev => ({ ...prev, [`${index}.${field}`]: '' }))
  }

  function toggleEspecialidade(index: number, especialidade: string) {
    setSocios(prev => prev.map((s, i) => {
      if (i !== index) return s
      const has = s.especialidades.includes(especialidade)
      return {
        ...s,
        especialidades: has
          ? s.especialidades.filter(e => e !== especialidade)
          : [...s.especialidades, especialidade],
      }
    }))
  }

  function adicionarSocio() {
    setSocios(prev => [...prev.map(s => ({ ...s, expanded: false })), criarSocioVazio(prev.length)])
  }

  function removerSocio(index: number) {
    if (socios.length <= 1) return
    setSocios(prev => prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, ordem: i })))
  }

  function toggleExpanded(index: number) {
    setSocios(prev => prev.map((s, i) => ({ ...s, expanded: i === index ? !s.expanded : s.expanded })))
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const index = uploadTargetIndex.current
    setUploadingIndex(index)

    try {
      const url = await uploadFotoSocio(userId, file)
      updateSocio(index, 'foto_url', url)
    } catch {
      setErrors(prev => ({ ...prev, [`${index}.foto_url`]: 'Erro ao fazer upload' }))
    } finally {
      setUploadingIndex(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function triggerUpload(index: number) {
    uploadTargetIndex.current = index
    fileInputRef.current?.click()
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    socios.forEach((s, i) => {
      if (!s.nome_completo.trim()) {
        newErrors[`${i}.nome_completo`] = 'Nome é obrigatório'
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    await onSave(socios.map(({ expanded, ...rest }) => rest))
  }

  return (
    <motion.div variants={slideUp} initial="hidden" animate="visible">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Sócios e Contadores</h2>
          <p className="text-sm text-gray-500">Profissionais que aparecem na landing page</p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatePresence>
          {socios.map((socio, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-lg border border-gray-200 bg-white"
            >
              {/* Header colapsável */}
              <button
                type="button"
                onClick={() => toggleExpanded(index)}
                className="flex w-full items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  {socio.foto_url ? (
                    <img
                      src={socio.foto_url}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500">
                      {index + 1}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-900">
                    {socio.nome_completo || `Sócio ${index + 1}`}
                  </span>
                  {socio.cargo && (
                    <span className="text-xs text-gray-400">{socio.cargo}</span>
                  )}
                </div>
                {socio.expanded ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </button>

              {/* Conteúdo expandido */}
              {socio.expanded && (
                <div className="space-y-4 border-t border-gray-100 p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Nome Completo *
                      </label>
                      <Input
                        placeholder="Nome do sócio/contador"
                        value={socio.nome_completo}
                        onChange={(e) => updateSocio(index, 'nome_completo', e.target.value)}
                        error={errors[`${index}.nome_completo`]}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Cargo
                      </label>
                      <select
                        value={socio.cargo}
                        onChange={(e) => updateSocio(index, 'cargo', e.target.value)}
                        className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
                      >
                        <option value="">Selecione...</option>
                        {CARGOS_ESCRITORIO.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        CRC (Número)
                      </label>
                      <Input
                        placeholder="Ex: 123456"
                        value={socio.crc_numero}
                        onChange={(e) => updateSocio(index, 'crc_numero', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        CRC (Estado)
                      </label>
                      <select
                        value={socio.crc_estado}
                        onChange={(e) => updateSocio(index, 'crc_estado', e.target.value)}
                        className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
                      >
                        <option value="">UF</option>
                        {ESTADOS_BRASILEIROS.map(uf => (
                          <option key={uf} value={uf}>{uf}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Foto */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Foto
                    </label>
                    <div className="flex items-center gap-3">
                      {socio.foto_url ? (
                        <img
                          src={socio.foto_url}
                          alt=""
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                          <Upload className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => triggerUpload(index)}
                        isLoading={uploadingIndex === index}
                      >
                        {socio.foto_url ? 'Trocar foto' : 'Enviar foto'}
                      </Button>
                    </div>
                    {errors[`${index}.foto_url`] && (
                      <p className="mt-1 text-xs text-red-500">{errors[`${index}.foto_url`]}</p>
                    )}
                  </div>

                  {/* Especialidades */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Especialidades
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ESPECIALIDADES_CONTABEIS.map(esp => (
                        <button
                          key={esp}
                          type="button"
                          onClick={() => toggleEspecialidade(index, esp)}
                          className={cn(
                            'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                            socio.especialidades.includes(esp)
                              ? 'bg-brand-100 text-brand-700'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
                          )}
                        >
                          {esp}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Mini Bio
                    </label>
                    <Textarea
                      placeholder="Breve descrição do profissional para a landing page..."
                      value={socio.mini_bio}
                      onChange={(e) => updateSocio(index, 'mini_bio', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={socio.exibir_landing_page}
                        onChange={(e) => updateSocio(index, 'exibir_landing_page', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                      />
                      Exibir na landing page
                    </label>

                    {socios.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removerSocio(index)}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remover
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        <button
          type="button"
          onClick={adicionarSocio}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 p-3 text-sm font-medium text-gray-500 transition-colors hover:border-brand-300 hover:text-brand-600"
        >
          <Plus className="h-4 w-4" />
          Adicionar sócio/contador
        </button>

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
