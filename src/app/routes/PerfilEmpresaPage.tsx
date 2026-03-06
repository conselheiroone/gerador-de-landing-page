import { useState, useRef, useEffect, type FormEvent } from 'react'
import {
  Building2,
  Users,
  MapPin,
  Palette,
  BookOpen,
  Briefcase,
  Globe,
  ChevronDown,
  Check,
  Plus,
  Trash2,
  Upload,
  ImageIcon,
  ChevronUp,
  Star,
  Download,
  ExternalLink,
  X,
} from 'lucide-react'
import {
  fetchDepoimentos,
  importarReviewsDoGoogle,
  upsertDepoimento,
  deleteDepoimento,
} from '@/features/depoimentos/api/depoimentos-api'
import type { Depoimento } from '@/features/onboarding/types/onboarding.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { extractColorsFromFile } from '@/utils/extract-colors'
import { usePerfilEmpresa } from '@/features/onboarding/hooks/usePerfilEmpresa'
import type { Socio, ServicoItem } from '@/features/onboarding/types/onboarding.types'
import { HorarioSelector } from '@/features/onboarding/components/HorarioSelector'
import {
  ESPECIALIDADES_CONTABEIS,
  CARGOS_ESCRITORIO,
  ESTADOS_BRASILEIROS,
  SERVICOS_SUGERIDOS,
} from '@/features/onboarding/types/onboarding.types'

// ==================== SAVE BUTTON WITH FEEDBACK ====================

function SaveButton({ isSaving, isSaved }: { isSaving: boolean; isSaved: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {isSaved && (
        <span className="flex items-center gap-1 text-xs font-medium text-green-600 animate-in fade-in">
          <Check className="h-3.5 w-3.5" /> Salvo com sucesso
        </span>
      )}
      <Button type="submit" size="sm" isLoading={isSaving}>Salvar alteracoes</Button>
    </div>
  )
}

// ==================== SECTION WRAPPER ====================

function Section({
  id: _id,
  icon,
  title,
  summary,
  isOpen,
  onToggle,
  isSaving,
  isSaved,
  children,
}: {
  id: string
  icon: React.ReactNode
  title: string
  summary: string
  isOpen: boolean
  onToggle: () => void
  isSaving: boolean
  isSaved: boolean
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between p-5"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            {icon}
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500 line-clamp-1">{summary}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSaved && (
            <span className="flex items-center gap-1 text-xs font-medium text-green-600">
              <Check className="h-3.5 w-3.5" /> Salvo
            </span>
          )}
          {isSaving && (
            <span className="text-xs text-gray-400">Salvando...</span>
          )}
          <ChevronDown
            className={cn(
              'h-5 w-5 text-gray-400 transition-transform',
              isOpen && 'rotate-180',
            )}
          />
        </div>
      </button>
      {isOpen && (
        <div className="border-t border-gray-100 p-5">{children}</div>
      )}
    </div>
  )
}

// ==================== PAGE ====================

export function PerfilEmpresaPage() {
  const {
    perfil,
    socios,
    userId,
    isLoading,
    savingSection,
    savedSection,
    error,
    updateDadosEscritorio,
    updateSocios,
    updateContato,
    updateIdentidadeVisual,
    updateSobre,
    updateServicos,
    updateRedesSociais,
    updateGooglePlaceId,
    uploadLogo,
    uploadHeroImage,
    uploadFotoSocio,
    buscarCep,
  } = usePerfilEmpresa()

  const [openSection, setOpenSection] = useState<string | null>('dados')

  function toggleSection(id: string) {
    setOpenSection(prev => (prev === id ? null : id))
  }

  if (isLoading || !perfil) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Perfil da Empresa</h1>
        <p className="text-sm text-gray-500">
          Edite as informações do seu escritório. Esses dados alimentam a geração de landing pages.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 1. Dados do Escritório */}
      <Section
        id="dados"
        icon={<Building2 className="h-5 w-5" />}
        title="Dados do Escritório"
        summary={perfil.nome_empresa || 'Nenhuma informação preenchida'}
        isOpen={openSection === 'dados'}
        onToggle={() => toggleSection('dados')}
        isSaving={savingSection === 'dados'}
        isSaved={savedSection === 'dados'}
      >
        <DadosEscritorioForm
          perfil={perfil}
          isSaving={savingSection === 'dados'}
          isSaved={savedSection === 'dados'}
          onSave={updateDadosEscritorio}
        />
      </Section>

      {/* 2. Sócios */}
      <Section
        id="socios"
        icon={<Users className="h-5 w-5" />}
        title="Socios e Contadores"
        summary={socios.length > 0 ? `${socios.length} profissional(is)` : 'Nenhum socio cadastrado'}
        isOpen={openSection === 'socios'}
        onToggle={() => toggleSection('socios')}
        isSaving={savingSection === 'socios'}
        isSaved={savedSection === 'socios'}
      >
        <SociosForm
          sociosIniciais={socios}
          userId={userId!}
          isSaving={savingSection === 'socios'}
          isSaved={savedSection === 'socios'}
          onSave={updateSocios}
          uploadFotoSocio={uploadFotoSocio}
        />
      </Section>

      {/* 3. Contato */}
      <Section
        id="contato"
        icon={<MapPin className="h-5 w-5" />}
        title="Contato e Localizacao"
        summary={[perfil.cidade, perfil.estado].filter(Boolean).join('/') || 'Nenhum endereco'}
        isOpen={openSection === 'contato'}
        onToggle={() => toggleSection('contato')}
        isSaving={savingSection === 'contato'}
        isSaved={savedSection === 'contato'}
      >
        <ContatoForm
          perfil={perfil}
          isSaving={savingSection === 'contato'}
          isSaved={savedSection === 'contato'}
          onSave={updateContato}
          buscarCep={buscarCep}
        />
      </Section>

      {/* 4. Identidade Visual */}
      <Section
        id="visual"
        icon={<Palette className="h-5 w-5" />}
        title="Identidade Visual"
        summary={perfil.logo_url ? 'Logo e cores configurados' : 'Sem logo'}
        isOpen={openSection === 'visual'}
        onToggle={() => toggleSection('visual')}
        isSaving={savingSection === 'visual'}
        isSaved={savedSection === 'visual'}
      >
        <IdentidadeVisualForm
          perfil={perfil}
          userId={userId!}
          isSaving={savingSection === 'visual'}
          isSaved={savedSection === 'visual'}
          onSave={updateIdentidadeVisual}
          uploadLogo={uploadLogo}
          uploadHeroImage={uploadHeroImage}
        />
      </Section>

      {/* 5. Sobre */}
      <Section
        id="sobre"
        icon={<BookOpen className="h-5 w-5" />}
        title="Sobre o Escritório"
        summary={perfil.historia ? 'História e valores preenchidos' : 'Nenhuma informação'}
        isOpen={openSection === 'sobre'}
        onToggle={() => toggleSection('sobre')}
        isSaving={savingSection === 'sobre'}
        isSaved={savedSection === 'sobre'}
      >
        <SobreForm
          perfil={perfil}
          isSaving={savingSection === 'sobre'}
          isSaved={savedSection === 'sobre'}
          onSave={updateSobre}
        />
      </Section>

      {/* 6. Serviços */}
      <Section
        id="servicos"
        icon={<Briefcase className="h-5 w-5" />}
        title="Serviços"
        summary={perfil.servicos.length > 0 ? `${perfil.servicos.length} serviço(s)` : 'Nenhum serviço'}
        isOpen={openSection === 'servicos'}
        onToggle={() => toggleSection('servicos')}
        isSaving={savingSection === 'servicos'}
        isSaved={savedSection === 'servicos'}
      >
        <ServicosForm
          perfil={perfil}
          isSaving={savingSection === 'servicos'}
          isSaved={savedSection === 'servicos'}
          onSave={updateServicos}
        />
      </Section>

      {/* 7. Redes Sociais */}
      <Section
        id="redes"
        icon={<Globe className="h-5 w-5" />}
        title="Redes Sociais"
        summary={
          Object.values(perfil.redes_sociais || {}).filter(Boolean).length > 0
            ? `${Object.values(perfil.redes_sociais || {}).filter(Boolean).length} rede(s)`
            : 'Nenhuma rede social'
        }
        isOpen={openSection === 'redes'}
        onToggle={() => toggleSection('redes')}
        isSaving={savingSection === 'redes'}
        isSaved={savedSection === 'redes'}
      >
        <RedesSociaisForm
          perfil={perfil}
          isSaving={savingSection === 'redes'}
          isSaved={savedSection === 'redes'}
          onSave={updateRedesSociais}
        />
      </Section>

      {/* 8. Depoimentos */}
      <Section
        id="depoimentos"
        icon={<Star className="h-5 w-5" />}
        title="Depoimentos de Clientes"
        summary={perfil.google_place_id ? `Google Place ID configurado` : 'Adicione avaliações reais ou manuais'}
        isOpen={openSection === 'depoimentos'}
        onToggle={() => toggleSection('depoimentos')}
        isSaving={savingSection === 'depoimentos'}
        isSaved={savedSection === 'depoimentos'}
      >
        <DepoimentosForm
          perfilId={perfil.id}
          googlePlaceIdInicial={perfil.google_place_id}
          isSavingPlaceId={savingSection === 'depoimentos'}
          onSavePlaceId={updateGooglePlaceId}
        />
      </Section>
    </div>
  )
}

// ==================== FORM: DADOS DO ESCRITÓRIO ====================

function DadosEscritorioForm({
  perfil,
  isSaving,
  isSaved,
  onSave,
}: {
  perfil: { nome_empresa: string | null; cnpj: string | null; tipo_escritorio: 'individual' | 'sociedade' | null; slogan: string | null; ano_fundacao: number | null }
  isSaving: boolean
  isSaved: boolean
  onSave: (dados: { nome_empresa: string; cnpj: string; tipo_escritorio: 'individual' | 'sociedade'; slogan: string; ano_fundacao: string }) => Promise<void>
}) {
  const [nome, setNome] = useState(perfil.nome_empresa ?? '')
  const [cnpj, setCnpj] = useState(perfil.cnpj ?? '')
  const [tipo, setTipo] = useState<'individual' | 'sociedade'>(perfil.tipo_escritorio ?? 'individual')
  const [slogan, setSlogan] = useState(perfil.slogan ?? '')
  const [ano, setAno] = useState(perfil.ano_fundacao?.toString() ?? '')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await onSave({ nome_empresa: nome, cnpj, tipo_escritorio: tipo, slogan, ano_fundacao: ano })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Nome do Escritório</label>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da empresa" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">CNPJ</label>
          <Input value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0001-00" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Tipo</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as 'individual' | 'sociedade')}
            className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10"
          >
            <option value="individual">Individual</option>
            <option value="sociedade">Sociedade</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Ano de Fundação</label>
          <Input value={ano} onChange={(e) => setAno(e.target.value)} placeholder="2010" type="number" />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Slogan</label>
        <Input value={slogan} onChange={(e) => setSlogan(e.target.value)} placeholder="Frase que define seu escritório" />
      </div>
      <div className="flex justify-end pt-2">
        <SaveButton isSaving={isSaving} isSaved={isSaved} />
      </div>
    </form>
  )
}

// ==================== FORM: SÓCIOS ====================

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
  return { id: '', nome_completo: '', crc_numero: '', crc_estado: '', cargo: '', foto_url: '', especialidades: [], mini_bio: '', exibir_landing_page: true, ordem, expanded: true }
}

function SociosForm({
  sociosIniciais,
  userId,
  isSaving,
  isSaved,
  onSave,
  uploadFotoSocio,
}: {
  sociosIniciais: Socio[]
  userId: string
  isSaving: boolean
  isSaved: boolean
  onSave: (socios: Array<Omit<Socio, 'created_at' | 'updated_at' | 'perfil_empresa_id'>>) => Promise<void>
  uploadFotoSocio: (userId: string, file: File) => Promise<string>
}) {
  const [sociosList, setSociosList] = useState<SocioForm[]>(() => {
    if (sociosIniciais.length > 0) {
      return sociosIniciais.map((s, i) => ({
        id: s.id, nome_completo: s.nome_completo, crc_numero: s.crc_numero ?? '', crc_estado: s.crc_estado ?? '',
        cargo: s.cargo ?? '', foto_url: s.foto_url ?? '', especialidades: s.especialidades ?? [],
        mini_bio: s.mini_bio ?? '', exibir_landing_page: s.exibir_landing_page, ordem: s.ordem, expanded: i === 0,
      }))
    }
    return [criarSocioVazio(0)]
  })
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadTargetIndex = useRef<number>(0)

  function updateSocio(index: number, field: keyof SocioForm, value: unknown) {
    setSociosList(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
  }

  function toggleEspecialidade(index: number, esp: string) {
    setSociosList(prev => prev.map((s, i) => {
      if (i !== index) return s
      const has = s.especialidades.includes(esp)
      return { ...s, especialidades: has ? s.especialidades.filter(e => e !== esp) : [...s.especialidades, esp] }
    }))
  }

  function adicionarSocio() {
    setSociosList(prev => [...prev.map(s => ({ ...s, expanded: false })), criarSocioVazio(prev.length)])
  }

  function removerSocio(index: number) {
    if (sociosList.length <= 1) return
    setSociosList(prev => prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, ordem: i })))
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const index = uploadTargetIndex.current
    setUploadingIndex(index)
    try {
      const url = await uploadFotoSocio(userId, file)
      updateSocio(index, 'foto_url', url)
    } finally {
      setUploadingIndex(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await onSave(sociosList.map(({ expanded, ...rest }) => rest))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      {sociosList.map((socio, index) => (
        <div key={index} className="rounded-lg border border-gray-200">
          <button
            type="button"
            onClick={() => updateSocio(index, 'expanded', !socio.expanded)}
            className="flex w-full items-center justify-between p-3"
          >
            <div className="flex items-center gap-2">
              {socio.foto_url ? (
                <img src={socio.foto_url} alt="" className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500">{index + 1}</div>
              )}
              <span className="text-sm font-medium text-gray-900">{socio.nome_completo || `Socio ${index + 1}`}</span>
            </div>
            {socio.expanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
          </button>
          {socio.expanded && (
            <div className="space-y-3 border-t border-gray-100 p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Nome Completo *</label>
                  <Input value={socio.nome_completo} onChange={(e) => updateSocio(index, 'nome_completo', e.target.value)} placeholder="Nome" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Cargo</label>
                  <select value={socio.cargo} onChange={(e) => updateSocio(index, 'cargo', e.target.value)} className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10">
                    <option value="">Selecione...</option>
                    {CARGOS_ESCRITORIO.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">CRC (Numero)</label>
                  <Input value={socio.crc_numero} onChange={(e) => updateSocio(index, 'crc_numero', e.target.value)} placeholder="123456" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">CRC (Estado)</label>
                  <select value={socio.crc_estado} onChange={(e) => updateSocio(index, 'crc_estado', e.target.value)} className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10">
                    <option value="">UF</option>
                    {ESTADOS_BRASILEIROS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Foto</label>
                <div className="flex items-center gap-3">
                  {socio.foto_url ? (
                    <img src={socio.foto_url} alt="" className="h-14 w-14 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100"><Upload className="h-5 w-5 text-gray-400" /></div>
                  )}
                  <Button type="button" variant="outline" size="sm" isLoading={uploadingIndex === index} onClick={() => { uploadTargetIndex.current = index; fileInputRef.current?.click() }}>
                    {socio.foto_url ? 'Trocar foto' : 'Enviar foto'}
                  </Button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Especialidades</label>
                <div className="flex flex-wrap gap-1.5">
                  {ESPECIALIDADES_CONTABEIS.map(esp => (
                    <button key={esp} type="button" onClick={() => toggleEspecialidade(index, esp)}
                      className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors', socio.especialidades.includes(esp) ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>
                      {esp}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Mini Bio</label>
                <Textarea value={socio.mini_bio} onChange={(e) => updateSocio(index, 'mini_bio', e.target.value)} rows={2} placeholder="Breve descricao..." />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={socio.exibir_landing_page} onChange={(e) => updateSocio(index, 'exibir_landing_page', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-500" />
                  Exibir na landing page
                </label>
                {sociosList.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removerSocio(index)} className="text-red-500 hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" /> Remover
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
      <button type="button" onClick={adicionarSocio} className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 p-2.5 text-sm font-medium text-gray-500 hover:border-brand-300 hover:text-brand-600">
        <Plus className="h-4 w-4" /> Adicionar socio
      </button>
      <div className="flex justify-end pt-2">
        <SaveButton isSaving={isSaving} isSaved={isSaved} />
      </div>
    </form>
  )
}

// ==================== FORM: CONTATO ====================

function ContatoForm({
  perfil,
  isSaving,
  isSaved,
  onSave,
  buscarCep,
}: {
  perfil: { telefone: string | null; whatsapp: string | null; email_contato: string | null; horario_atendimento: string | null; cep: string | null; logradouro: string | null; numero: string | null; complemento: string | null; bairro: string | null; cidade: string | null; estado: string | null }
  isSaving: boolean
  isSaved: boolean
  onSave: (dados: { telefone: string; whatsapp: string; email_contato: string; horario_atendimento: string; cep: string; logradouro: string; numero: string; complemento: string; bairro: string; cidade: string; estado: string }) => Promise<void>
  buscarCep: (cep: string) => Promise<{ logradouro: string; bairro: string; localidade: string; uf: string } | null>
}) {
  const [telefone, setTelefone] = useState(perfil.telefone ?? '')
  const [whatsapp, setWhatsapp] = useState(perfil.whatsapp ?? '')
  const [email, setEmail] = useState(perfil.email_contato ?? '')
  const [horario, setHorario] = useState(perfil.horario_atendimento ?? '')
  const [cep, setCep] = useState(perfil.cep ?? '')
  const [logradouro, setLogradouro] = useState(perfil.logradouro ?? '')
  const [numero, setNumero] = useState(perfil.numero ?? '')
  const [complemento, setComplemento] = useState(perfil.complemento ?? '')
  const [bairro, setBairro] = useState(perfil.bairro ?? '')
  const [cidade, setCidade] = useState(perfil.cidade ?? '')
  const [estado, setEstado] = useState(perfil.estado ?? '')

  async function handleCepBlur() {
    const result = await buscarCep(cep)
    if (result) {
      setLogradouro(result.logradouro)
      setBairro(result.bairro)
      setCidade(result.localidade)
      setEstado(result.uf)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await onSave({ telefone, whatsapp, email_contato: email, horario_atendimento: horario, cep, logradouro, numero, complemento, bairro, cidade, estado })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Telefone</label>
          <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 3000-0000" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">WhatsApp</label>
          <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(11) 99000-0000" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">E-mail de contato</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contato@empresa.com" type="email" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Horário de Atendimento</label>
          <HorarioSelector value={horario} onChange={setHorario} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">CEP</label>
          <Input value={cep} onChange={(e) => setCep(e.target.value)} onBlur={handleCepBlur} placeholder="00000-000" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Logradouro</label>
          <Input value={logradouro} onChange={(e) => setLogradouro(e.target.value)} placeholder="Rua, Av..." />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Numero</label>
          <Input value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="123" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Complemento</label>
          <Input value={complemento} onChange={(e) => setComplemento(e.target.value)} placeholder="Sala 5" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Bairro</label>
          <Input value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Centro" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Cidade</label>
          <Input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Sao Paulo" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Estado</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value)} className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10">
            <option value="">Selecione...</option>
            {ESTADOS_BRASILEIROS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
          </select>
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <SaveButton isSaving={isSaving} isSaved={isSaved} />
      </div>
    </form>
  )
}

// ==================== FORM: IDENTIDADE VISUAL ====================

function IdentidadeVisualForm({
  perfil,
  userId,
  isSaving,
  isSaved,
  onSave,
  uploadLogo,
  uploadHeroImage,
}: {
  perfil: { logo_url: string | null; cor_primaria: string; cor_secundaria: string; usar_imagem_hero: boolean; hero_image_url: string | null }
  userId: string
  isSaving: boolean
  isSaved: boolean
  onSave: (dados: { logo_url: string; cor_primaria: string; cor_secundaria: string; usar_imagem_hero: boolean; hero_image_url: string }) => Promise<void>
  uploadLogo: (userId: string, file: File) => Promise<string>
  uploadHeroImage: (userId: string, file: File) => Promise<string>
}) {
  const [logoUrl, setLogoUrl] = useState(perfil.logo_url ?? '')
  const [corPrimaria, setCorPrimaria] = useState(perfil.cor_primaria)
  const [corSecundaria, setCorSecundaria] = useState(perfil.cor_secundaria)
  const [usarImagemHero, setUsarImagemHero] = useState(perfil.usar_imagem_hero ?? false)
  const [heroImageUrl, setHeroImageUrl] = useState(perfil.hero_image_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [uploadingHero, setUploadingHero] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const heroFileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
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
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleHeroFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingHero(true)
    try {
      const url = await uploadHeroImage(userId, file)
      setHeroImageUrl(url)
    } finally {
      setUploadingHero(false)
      if (heroFileInputRef.current) heroFileInputRef.current.value = ''
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await onSave({ logo_url: logoUrl, cor_primaria: corPrimaria, cor_secundaria: corSecundaria, usar_imagem_hero: usarImagemHero, hero_image_url: heroImageUrl })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="hidden" onChange={handleFileChange} />
      <input ref={heroFileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleHeroFileChange} />
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Logo da Empresa</label>
        <div className="flex items-center gap-4">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-20 w-20 rounded-xl border border-gray-200 object-contain p-2" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
              <Upload className="h-6 w-6 text-gray-300" />
            </div>
          )}
          <Button type="button" variant="outline" size="sm" isLoading={uploading} onClick={() => fileInputRef.current?.click()}>
            {logoUrl ? 'Trocar logo' : 'Enviar logo'}
          </Button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
          <input type="color" value={corPrimaria} onChange={(e) => setCorPrimaria(e.target.value)} className="h-10 w-10 cursor-pointer rounded border-0 bg-transparent" />
          <div>
            <p className="text-sm font-medium text-gray-900">Cor Primaria</p>
            <p className="text-xs text-gray-500 uppercase">{corPrimaria}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
          <input type="color" value={corSecundaria} onChange={(e) => setCorSecundaria(e.target.value)} className="h-10 w-10 cursor-pointer rounded border-0 bg-transparent" />
          <div>
            <p className="text-sm font-medium text-gray-900">Cor Secundaria</p>
            <p className="text-xs text-gray-500 uppercase">{corSecundaria}</p>
          </div>
        </div>
      </div>

      {/* Imagem de Fundo do Hero */}
      <div className="rounded-lg border border-gray-200 p-4">
        <label className="mb-3 block text-sm font-medium text-gray-700">
          Imagem de fundo no topo da pagina
        </label>
        <div className="flex gap-3 mb-3">
          <button
            type="button"
            onClick={() => setUsarImagemHero(true)}
            className={cn('px-4 py-2 text-sm rounded-lg border transition-colors', usarImagemHero ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50')}
          >
            Sim
          </button>
          <button
            type="button"
            onClick={() => setUsarImagemHero(false)}
            className={cn('px-4 py-2 text-sm rounded-lg border transition-colors', !usarImagemHero ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50')}
          >
            Nao
          </button>
        </div>
        {usarImagemHero && (
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Envie uma imagem personalizada ou use a imagem padrao com tema de contabilidade.
            </p>
            <div className="flex items-center gap-4">
              <img
                src={heroImageUrl || '/assets/hero/contabilidade-default.svg'}
                alt="Hero background"
                className="h-16 w-28 rounded-lg border border-gray-200 object-cover"
              />
              <div className="space-y-1">
                <Button type="button" variant="outline" size="sm" isLoading={uploadingHero} onClick={() => heroFileInputRef.current?.click()}>
                  {heroImageUrl ? 'Trocar imagem' : 'Enviar imagem personalizada'}
                </Button>
                <p className="text-xs text-gray-400">PNG, JPG ou WebP. 1920x1080 recomendado.</p>
                {!heroImageUrl && (
                  <p className="text-xs text-blue-500">Usando imagem padrao de contabilidade</p>
                )}
              </div>
            </div>
            {heroImageUrl && (
              <button type="button" onClick={() => setHeroImageUrl('')} className="text-xs text-red-500 hover:text-red-700">
                Remover imagem (usar padrao)
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <SaveButton isSaving={isSaving} isSaved={isSaved} />
      </div>
    </form>
  )
}

// ==================== FORM: SOBRE ====================

function SobreForm({
  perfil,
  isSaving,
  isSaved,
  onSave,
}: {
  perfil: { historia: string | null; missao: string | null; visao: string | null; valores: string | null; diferenciais: string[] }
  isSaving: boolean
  isSaved: boolean
  onSave: (dados: { historia: string; missao: string; visao: string; valores: string; diferenciais: string[] }) => Promise<void>
}) {
  const [historia, setHistoria] = useState(perfil.historia ?? '')
  const [missao, setMissao] = useState(perfil.missao ?? '')
  const [visao, setVisao] = useState(perfil.visao ?? '')
  const [valores, setValores] = useState(perfil.valores ?? '')
  const [diferenciais, setDiferenciais] = useState<string[]>(perfil.diferenciais ?? [])
  const [novoDif, setNovoDif] = useState('')

  function addDiferencial() {
    const d = novoDif.trim()
    if (d && !diferenciais.includes(d)) {
      setDiferenciais(prev => [...prev, d])
      setNovoDif('')
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await onSave({ historia, missao, visao, valores, diferenciais })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">História</label>
        <Textarea value={historia} onChange={(e) => setHistoria(e.target.value)} rows={3} placeholder="Conte a história do escritório..." />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Missão</label>
          <Textarea value={missao} onChange={(e) => setMissao(e.target.value)} rows={2} placeholder="Missão do escritório" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Visão</label>
          <Textarea value={visao} onChange={(e) => setVisao(e.target.value)} rows={2} placeholder="Visão do escritório" />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Valores</label>
        <Textarea value={valores} onChange={(e) => setValores(e.target.value)} rows={2} placeholder="Ética, transparência, inovação..." />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Diferenciais</label>
        <div className="flex gap-2">
          <Input value={novoDif} onChange={(e) => setNovoDif(e.target.value)} placeholder="Adicionar diferencial" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDiferencial() } }} />
          <Button type="button" variant="outline" size="sm" onClick={addDiferencial}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {diferenciais.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {diferenciais.map((d, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                {d}
                <button type="button" onClick={() => setDiferenciais(prev => prev.filter((_, idx) => idx !== i))} className="hover:text-red-500">&times;</button>
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-end pt-2">
        <SaveButton isSaving={isSaving} isSaved={isSaved} />
      </div>
    </form>
  )
}

// ==================== FORM: SERVIÇOS ====================

function ServicosForm({
  perfil,
  isSaving,
  isSaved,
  onSave,
}: {
  perfil: { servicos: ServicoItem[] }
  isSaving: boolean
  isSaved: boolean
  onSave: (servicos: ServicoItem[]) => Promise<void>
}) {
  const [servicos, setServicos] = useState<ServicoItem[]>(perfil.servicos ?? [])
  const [novoServico, setNovoServico] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  function addServico(nome: string) {
    const n = nome.trim()
    if (n && !servicos.some(s => s.nome === n)) {
      setServicos(prev => [...prev, { nome: n }])
      setNovoServico('')
    }
  }

  function updateDescricao(index: number, descricao: string) {
    setServicos(prev => prev.map((s, i) => i === index ? { ...s, descricao } : s))
  }

  function removeServico(index: number) {
    setServicos(prev => prev.filter((_, idx) => idx !== index))
    if (editingIndex === index) setEditingIndex(null)
    else if (editingIndex !== null && editingIndex > index) setEditingIndex(editingIndex - 1)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await onSave(servicos)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Serviços sugeridos</label>
        <div className="flex flex-wrap gap-1.5">
          {SERVICOS_SUGERIDOS.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => addServico(s)}
              className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
                servicos.some(sv => sv.nome === s)
                  ? 'bg-brand-100 text-brand-700'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Adicionar serviço personalizado</label>
        <div className="flex gap-2">
          <Input value={novoServico} onChange={(e) => setNovoServico(e.target.value)} placeholder="Nome do serviço" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addServico(novoServico) } }} />
          <Button type="button" variant="outline" size="sm" onClick={() => addServico(novoServico)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {servicos.length > 0 && (
        <div className="space-y-1.5">
          {servicos.map((s, i) => (
            <div key={i} className="rounded-lg border border-gray-100 bg-white">
              <div className="flex items-center gap-2 px-3 py-2">
                <span className="flex-1 text-sm font-medium text-brand-700">{s.nome}</span>
                <button
                  type="button"
                  onClick={() => setEditingIndex(editingIndex === i ? null : i)}
                  className="rounded px-1.5 py-0.5 text-[10px] text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  {s.descricao ? 'editar' : '+ descrição'}
                </button>
                <button type="button" onClick={() => removeServico(i)} className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              {editingIndex === i && (
                <div className="border-t border-gray-50 px-3 pb-3 pt-2">
                  <textarea
                    value={s.descricao ?? ''}
                    onChange={(e) => updateDescricao(i, e.target.value)}
                    placeholder="Descreva este serviço para a landing page (opcional)"
                    rows={2}
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/20"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-end pt-2">
        <SaveButton isSaving={isSaving} isSaved={isSaved} />
      </div>
    </form>
  )
}

// ==================== FORM: DEPOIMENTOS ====================

function DepoimentosForm({
  perfilId,
  googlePlaceIdInicial,
  isSavingPlaceId,
  onSavePlaceId,
}: {
  perfilId: string
  googlePlaceIdInicial: string | null
  isSavingPlaceId: boolean
  onSavePlaceId: (placeId: string) => Promise<void>
}) {
  const [placeId, setPlaceId] = useState(googlePlaceIdInicial ?? '')
  const [depoimentos, setDepoimentos] = useState<Depoimento[]>([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [importMsg, setImportMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [editando, setEditando] = useState<number | null>(null)
  const [novoForm, setNovoForm] = useState<{ nomeCliente: string; cargo: string; citacao: string; nota: number } | null>(null)

  useEffect(() => {
    fetchDepoimentos(perfilId)
      .then(setDepoimentos)
      .catch(() => setDepoimentos([]))
      .finally(() => setLoading(false))
  }, [perfilId])

  async function handleSavePlaceId(e: FormEvent) {
    e.preventDefault()
    await onSavePlaceId(placeId)
  }

  async function handleImportar() {
    if (!placeId.trim()) return
    setImporting(true)
    setImportMsg(null)
    try {
      const { importados, duplicados } = await importarReviewsDoGoogle(perfilId, placeId.trim())
      const updated = await fetchDepoimentos(perfilId)
      setDepoimentos(updated)
      setImportMsg({
        type: 'success',
        text: `${importados} avaliação(ões) importada(s)${duplicados > 0 ? `, ${duplicados} já existia(m)` : ''}.`,
      })
    } catch (err) {
      setImportMsg({ type: 'error', text: err instanceof Error ? err.message : 'Erro ao importar.' })
    } finally {
      setImporting(false)
    }
  }

  async function handleDelete(id: string) {
    await deleteDepoimento(id)
    setDepoimentos(prev => prev.filter(d => d.id !== id))
  }

  async function handleSaveEdit(dep: Depoimento, i: number) {
    const updated = await upsertDepoimento({
      id: dep.id,
      perfil_empresa_id: dep.perfil_empresa_id,
      nome_cliente: dep.nome_cliente,
      cargo: dep.cargo,
      citacao: dep.citacao,
      nota: dep.nota,
      foto_url: dep.foto_url,
      source: dep.source,
      google_review_id: dep.google_review_id,
      ativo: dep.ativo,
      ordem: dep.ordem,
    })
    setDepoimentos(prev => prev.map((d, idx) => idx === i ? updated : d))
    setEditando(null)
  }

  async function handleAdicionarManual() {
    if (!novoForm || !novoForm.citacao.trim() || !novoForm.nomeCliente.trim()) return
    const created = await upsertDepoimento({
      perfil_empresa_id: perfilId,
      nome_cliente: novoForm.nomeCliente,
      cargo: novoForm.cargo || null,
      citacao: novoForm.citacao,
      nota: novoForm.nota,
      foto_url: null,
      source: 'manual',
      google_review_id: null,
      ativo: true,
      ordem: depoimentos.length,
    })
    setDepoimentos(prev => [...prev, created])
    setNovoForm(null)
  }

  return (
    <div className="space-y-5">
      {/* Google Place ID */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-semibold text-gray-800">Importar do Google</span>
        </div>
        <p className="text-xs text-gray-500">
          Informe o <strong>Google Place ID</strong> do seu escritório para importar avaliações reais automaticamente.
          {' '}
          <a
            href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-yellow-700 underline hover:text-yellow-800"
          >
            Encontrar meu Place ID <ExternalLink className="h-3 w-3" />
          </a>
        </p>
        <form onSubmit={handleSavePlaceId} className="flex gap-2">
          <input
            type="text"
            value={placeId}
            onChange={(e) => setPlaceId(e.target.value)}
            placeholder="Ex: ChIJN1t_tDeuEmsRUsoyG83frY4"
            className="flex h-9 flex-1 rounded-md border border-gray-200 bg-white px-3 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
          />
          <Button type="submit" size="sm" variant="outline" isLoading={isSavingPlaceId}>
            Salvar ID
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleImportar}
            isLoading={importing}
            disabled={!placeId.trim() || importing}
          >
            <Download className="h-4 w-4 mr-1" />
            Importar
          </Button>
        </form>
        {importMsg && (
          <p className={`text-xs font-medium ${importMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {importMsg.text}
          </p>
        )}
      </div>

      {/* Lista de depoimentos */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">
            Depoimentos ({depoimentos.length})
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setNovoForm({ nomeCliente: '', cargo: '', citacao: '', nota: 5 })}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar manual
          </Button>
        </div>

        {loading && (
          <p className="text-xs text-gray-400 py-2">Carregando...</p>
        )}

        {!loading && depoimentos.length === 0 && (
          <p className="text-xs text-gray-400 py-4 text-center">
            Nenhum depoimento cadastrado. Importe do Google ou adicione manualmente.
          </p>
        )}

        <div className="space-y-2">
          {depoimentos.map((dep, i) => (
            <div key={dep.id} className="rounded-lg border border-gray-200 bg-white p-3">
              {editando === i ? (
                <div className="space-y-2">
                  <textarea
                    value={dep.citacao}
                    onChange={(e) => setDepoimentos(prev => prev.map((d, idx) => idx === i ? { ...d, citacao: e.target.value } : d))}
                    rows={3}
                    className="w-full text-sm border border-gray-200 rounded px-2 py-1 resize-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={dep.nome_cliente}
                      onChange={(e) => setDepoimentos(prev => prev.map((d, idx) => idx === i ? { ...d, nome_cliente: e.target.value } : d))}
                      placeholder="Nome"
                      className="text-sm border border-gray-200 rounded px-2 py-1"
                    />
                    <input
                      type="text"
                      value={dep.cargo ?? ''}
                      onChange={(e) => setDepoimentos(prev => prev.map((d, idx) => idx === i ? { ...d, cargo: e.target.value } : d))}
                      placeholder="Cargo / Empresa"
                      className="text-sm border border-gray-200 rounded px-2 py-1"
                    />
                  </div>
                  {/* Estrelas */}
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setDepoimentos(prev => prev.map((d, idx) => idx === i ? { ...d, nota: s } : d))}
                        style={{ color: s <= dep.nota ? '#f59e0b' : '#d1d5db', fontSize: '18px', background: 'none', border: 'none', cursor: 'pointer' }}
                      >★</button>
                    ))}
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" size="sm" variant="ghost" onClick={() => setEditando(null)}>Cancelar</Button>
                    <Button type="button" size="sm" onClick={() => handleSaveEdit(dep, i)}>Salvar</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <span key={s} style={{ color: s < dep.nota ? '#f59e0b' : '#e2e8f0', fontSize: '13px' }}>★</span>
                      ))}
                      {dep.source === 'google' && (
                        <span className="ml-1 rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">Google</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 italic line-clamp-2">"{dep.citacao}"</p>
                    <p className="text-xs font-semibold text-gray-800 mt-1">{dep.nome_cliente}{dep.cargo && <span className="font-normal text-gray-500"> · {dep.cargo}</span>}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEditando(i)}
                      className="p-1 text-gray-400 hover:text-brand-600 rounded"
                      title="Editar"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(dep.id)}
                      className="p-1 text-gray-400 hover:text-red-500 rounded"
                      title="Remover"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Formulário novo depoimento manual */}
        {novoForm && (
          <div className="mt-3 rounded-lg border border-dashed border-brand-300 bg-brand-50 p-3 space-y-2">
            <p className="text-xs font-semibold text-brand-700">Novo depoimento</p>
            <textarea
              value={novoForm.citacao}
              onChange={(e) => setNovoForm(f => f ? { ...f, citacao: e.target.value } : f)}
              rows={3}
              placeholder="Citação do cliente..."
              className="w-full text-sm border border-gray-200 rounded px-2 py-1 resize-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={novoForm.nomeCliente}
                onChange={(e) => setNovoForm(f => f ? { ...f, nomeCliente: e.target.value } : f)}
                placeholder="Nome do cliente"
                className="text-sm border border-gray-200 rounded px-2 py-1"
              />
              <input
                type="text"
                value={novoForm.cargo}
                onChange={(e) => setNovoForm(f => f ? { ...f, cargo: e.target.value } : f)}
                placeholder="Cargo / Empresa"
                className="text-sm border border-gray-200 rounded px-2 py-1"
              />
            </div>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setNovoForm(f => f ? { ...f, nota: s } : f)}
                  style={{ color: s <= novoForm.nota ? '#f59e0b' : '#d1d5db', fontSize: '18px', background: 'none', border: 'none', cursor: 'pointer' }}
                >★</button>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" size="sm" variant="ghost" onClick={() => setNovoForm(null)}>Cancelar</Button>
              <Button type="button" size="sm" onClick={handleAdicionarManual}>Adicionar</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ==================== FORM: REDES SOCIAIS ====================

function RedesSociaisForm({
  perfil,
  isSaving,
  isSaved,
  onSave,
}: {
  perfil: { redes_sociais: { instagram?: string; facebook?: string; linkedin?: string; youtube?: string; site?: string; twitter?: string } }
  isSaving: boolean
  isSaved: boolean
  onSave: (redes: { instagram?: string; facebook?: string; linkedin?: string; youtube?: string; site?: string; twitter?: string }) => Promise<void>
}) {
  const redes = perfil.redes_sociais || {}
  const [instagram, setInstagram] = useState(redes.instagram ?? '')
  const [facebook, setFacebook] = useState(redes.facebook ?? '')
  const [linkedin, setLinkedin] = useState(redes.linkedin ?? '')
  const [youtube, setYoutube] = useState(redes.youtube ?? '')
  const [site, setSite] = useState(redes.site ?? '')
  const [twitter, setTwitter] = useState(redes.twitter ?? '')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await onSave({
      instagram: instagram || undefined,
      facebook: facebook || undefined,
      linkedin: linkedin || undefined,
      youtube: youtube || undefined,
      site: site || undefined,
      twitter: twitter || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Instagram</label>
          <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@seuescritorio" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Facebook</label>
          <Input value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="facebook.com/seuescritorio" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">LinkedIn</label>
          <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="linkedin.com/company/..." />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">YouTube</label>
          <Input value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="youtube.com/@canal" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Site</label>
          <Input value={site} onChange={(e) => setSite(e.target.value)} placeholder="www.seuescritorio.com.br" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Twitter / X</label>
          <Input value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="@seuescritorio" />
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <SaveButton isSaving={isSaving} isSaved={isSaved} />
      </div>
    </form>
  )
}
