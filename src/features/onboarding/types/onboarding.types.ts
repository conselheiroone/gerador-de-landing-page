export interface PerfilEmpresa {
  id: string
  user_id: string
  nome_empresa: string | null
  cnpj: string | null
  tipo_escritorio: 'individual' | 'sociedade' | null
  slogan: string | null
  ano_fundacao: number | null
  telefone: string | null
  whatsapp: string | null
  email_contato: string | null
  horario_atendimento: string | null
  cep: string | null
  logradouro: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  estado: string | null
  logo_url: string | null
  cor_primaria: string
  cor_secundaria: string
  historia: string | null
  missao: string | null
  visao: string | null
  valores: string | null
  diferenciais: DiferencialItem[]
  servicos: ServicoItem[]
  segmentos: SegmentoItem[]
  redes_sociais: RedesSociais
  google_place_id: string | null
  onboarding_completo: boolean
  etapa_atual: number
  created_at: string
  updated_at: string
}

export interface Socio {
  id: string
  perfil_empresa_id: string
  nome_completo: string
  crc_numero: string | null
  crc_estado: string | null
  cargo: string | null
  foto_url: string | null
  especialidades: string[]
  mini_bio: string | null
  exibir_landing_page: boolean
  ordem: number
  created_at: string
  updated_at: string
}

export interface Depoimento {
  id: string
  perfil_empresa_id: string
  nome_cliente: string
  cargo: string | null
  citacao: string
  nota: number
  foto_url: string | null
  source: 'manual' | 'google' | 'placeholder'
  google_review_id: string | null
  ativo: boolean
  ordem: number
  created_at: string
  updated_at: string
}

export interface DiferencialItem {
  nome: string
  descricao?: string
}

export interface ServicoItem {
  nome: string
  descricao?: string
}

export interface SegmentoItem {
  nome: string
  descricao?: string
}

export interface RedesSociais {
  instagram?: string
  facebook?: string
  linkedin?: string
  youtube?: string
  site?: string
  twitter?: string
}

export type SocioFormData = Omit<Socio, 'id' | 'perfil_empresa_id' | 'created_at' | 'updated_at'>

export interface DadosEscritorioForm {
  nome_empresa: string
  cnpj: string
  tipo_escritorio: 'individual' | 'sociedade'
  slogan: string
  ano_fundacao: string
}

export interface ContatoLocalizacaoForm {
  telefone: string
  whatsapp: string
  email_contato: string
  horario_atendimento: string
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
}

export interface IdentidadeVisualForm {
  logo_url: string
  cor_primaria: string
  cor_secundaria: string
}

export interface SobreEscritorioForm {
  historia: string
  missao: string
  visao: string
  valores: string
  diferenciais: DiferencialItem[]
}

export interface ServicosForm {
  servicos: ServicoItem[]
}

export interface SegmentosForm {
  segmentos: SegmentoItem[]
}

export interface RedesSociaisForm {
  instagram: string
  facebook: string
  linkedin: string
  youtube: string
  site: string
  twitter: string
}

export const ONBOARDING_STEPS = [
  { numero: 1, titulo: 'Dados do Escritório', descricao: 'Informações básicas da empresa' },
  { numero: 2, titulo: 'Sócios e Contadores', descricao: 'Profissionais do escritório' },
  { numero: 3, titulo: 'Contato e Localização', descricao: 'Como encontrar o escritório' },
  { numero: 4, titulo: 'Identidade Visual', descricao: 'Logo e cores da marca' },
  { numero: 5, titulo: 'Sobre o Escritório', descricao: 'História e valores' },
  { numero: 6, titulo: 'Serviços', descricao: 'O que o escritório oferece' },
  { numero: 7, titulo: 'Segmentos de Atuação', descricao: 'Quem o escritório atende' },
  { numero: 8, titulo: 'Redes Sociais', descricao: 'Presença online' },
  { numero: 9, titulo: 'Revisão', descricao: 'Confira e finalize' },
] as const

export const ESPECIALIDADES_CONTABEIS = [
  'Contabilidade Fiscal',
  'Contabilidade Trabalhista',
  'Contabilidade Societária',
  'Consultoria Tributária',
  'Planejamento Tributário',
  'Abertura de Empresas',
  'Imposto de Renda',
  'BPO Financeiro',
  'Auditoria',
  'Perícia Contábil',
  'Consultoria Empresarial',
  'Contabilidade Rural',
  'Contabilidade Digital',
  'Recuperação de Créditos',
] as const

export const SERVICOS_SUGERIDOS = [
  'Abertura e Encerramento de Empresas',
  'Contabilidade Mensal',
  'Folha de Pagamento',
  'Escrituração Fiscal',
  'Declaração de Imposto de Renda',
  'Planejamento Tributário',
  'BPO Financeiro',
  'Certidões e Regularizações',
  'Consultoria Empresarial',
  'Obrigações Acessórias',
  'Lucro Real / Presumido / Simples',
  'Balanços e Demonstrações',
  'Auditoria Contábil',
  'Recuperação de Créditos Tributários',
] as const

export const ESTADOS_BRASILEIROS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const

export const SEGMENTOS_SUGERIDOS = [
  'Agronegócios',
  'Startups',
  'Farmácias',
  'Médicos e Saúde',
  'Comércio',
  'Construção Civil',
  'Indústria',
  'Transportadoras',
  'Restaurantes e Alimentação',
  'E-commerce',
  'Educação',
  'Igrejas e Instituições Religiosas',
  'ONGs e Terceiro Setor',
  'Prestadores de Serviços',
  'Profissionais Liberais',
  'Condomínios',
] as const

export const CARGOS_ESCRITORIO = [
  'Sócio-fundador',
  'Sócio',
  'Contador Responsável',
  'Diretor',
  'Gerente',
  'Coordenador',
  'Analista Contábil',
] as const
