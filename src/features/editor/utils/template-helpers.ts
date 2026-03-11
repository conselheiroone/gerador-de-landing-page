/**
 * Helpers compartilhados entre os builders de seção do template.
 *
 * Contém constantes (descrições, ícones, assets) e funções utilitárias
 * usadas por múltiplas variantes de componente.
 */

import type { Depoimento } from '@/features/onboarding/types/onboarding.types'

// ─── Assets estáticos do template ────────────────────────────
export const ASSETS = {
  heroBg: '/assets/hero-bg.jpg',
  heroProfessional: '/assets/hero-professional.png',
  aboutOffice: '/assets/about-office.jpg',
  ctaBg: '/assets/cta-bg.jpg',
}

/** Largura máxima do conteúdo das seções (bg fica full-width) */
export const CONTENT_MAX_WIDTH = '1200px'

// ─── Descrições específicas para serviços contábeis ──────────
// Usadas como fallback quando o usuário não preenche descrição
export const SERVICE_DESCRIPTIONS: Record<string, string> = {
  'Abertura e Encerramento de Empresas': 'Assessoria completa para abertura, alteração e encerramento de empresas, incluindo registro em órgãos competentes e obtenção de licenças.',
  'Contabilidade Mensal': 'Escrituração contábil completa, balancetes mensais e relatórios gerenciais para acompanhamento da saúde financeira do seu negócio.',
  'Folha de Pagamento': 'Processamento completo da folha de pagamento, admissões, rescisões, férias e gestão de encargos trabalhistas.',
  'Escrituração Fiscal': 'Apuração de impostos, escrituração de livros fiscais e cumprimento de todas as obrigações tributárias da sua empresa.',
  'Declaração de Imposto de Renda': 'Elaboração e transmissão de declarações de IR para pessoas físicas e jurídicas com planejamento para otimização tributária.',
  'Planejamento Tributário': 'Análise e implementação de estratégias legais para redução da carga tributária e otimização fiscal do seu negócio.',
  'BPO Financeiro': 'Terceirização completa do departamento financeiro: contas a pagar, a receber, conciliação bancária e gestão de fluxo de caixa.',
  'Certidões e Regularizações': 'Obtenção de certidões negativas, regularização de pendências fiscais e trabalhistas junto aos órgãos competentes.',
  'Consultoria Empresarial': 'Orientação estratégica para tomada de decisões, análise de viabilidade e acompanhamento do desempenho empresarial.',
  'Obrigações Acessórias': 'Transmissão de SPED, EFD, DCTF, DIRF e demais declarações exigidas pelos fiscos federal, estadual e municipal.',
  'Lucro Real / Presumido / Simples': 'Enquadramento tributário adequado e gestão contábil específica para cada regime de tributação.',
  'Balanços e Demonstrações': 'Elaboração de balanços patrimoniais, DRE, fluxo de caixa e demais demonstrações contábeis obrigatórias.',
  'Auditoria Contábil': 'Revisão e validação dos registros contábeis, identificação de inconsistências e recomendações de melhorias.',
  'Recuperação de Créditos Tributários': 'Identificação e recuperação de tributos pagos a maior, aproveitamento de créditos e compensações fiscais.',
  // Variações comuns
  'Abertura de Empresas': 'Assessoria completa para abertura de empresas, incluindo registro em órgãos competentes e obtenção de alvarás e licenças.',
  'Encerramento de Empresas': 'Processo completo de baixa de empresas junto aos órgãos fiscais, trabalhistas e demais entidades.',
  'Imposto de Renda': 'Elaboração e transmissão de declarações de IR para pessoas físicas e jurídicas com orientação personalizada.',
  'Imposto de Renda PF': 'Declaração de Imposto de Renda para pessoas físicas com análise de deduções e planejamento tributário.',
  'Imposto de Renda PJ': 'Apuração e declaração do IRPJ com planejamento tributário para otimização da carga fiscal.',
  'Consultoria Tributária': 'Orientação especializada em questões fiscais, análise de cenários e definição de estratégias tributárias.',
  'Contabilidade Digital': 'Serviços contábeis 100% online com plataformas modernas, agilidade e atendimento personalizado.',
  'Contabilidade Rural': 'Assessoria contábil especializada para produtores rurais, com foco em benefícios fiscais do setor.',
  'Departamento Pessoal': 'Gestão completa de rotinas trabalhistas, admissões, rescisões, férias e obrigações acessórias.',
  'Gestão Fiscal': 'Acompanhamento e controle das obrigações fiscais, evitando multas e otimizando a carga tributária.',
  'Legalização de Empresas': 'Regularização de empresas junto aos órgãos competentes, obtenção de licenças e alvarás de funcionamento.',
  'Perícia Contábil': 'Elaboração de laudos periciais contábeis para processos judiciais e extrajudiciais.',
  'Contabilidade Societária': 'Assessoria em operações societárias, transformações, fusões, cisões e incorporações.',
}

/**
 * Retorna a descrição de um serviço.
 * Prioridade: descrição do usuário > descrição do mapa > fallback genérico baseado no nome
 */
export function getServiceDescription(nome: string, descricaoUsuario?: string): string {
  if (descricaoUsuario && descricaoUsuario.trim()) {
    return descricaoUsuario
  }
  const nomeNormalizado = nome.trim()
  const descricaoMapa = SERVICE_DESCRIPTIONS[nomeNormalizado]
  if (descricaoMapa) return descricaoMapa

  const chaveEncontrada = Object.keys(SERVICE_DESCRIPTIONS).find(chave =>
    nomeNormalizado.toLowerCase().includes(chave.toLowerCase()) ||
    chave.toLowerCase().includes(nomeNormalizado.toLowerCase())
  )
  if (chaveEncontrada) return SERVICE_DESCRIPTIONS[chaveEncontrada]

  return `Serviço de ${nome.toLowerCase()} com atendimento especializado, focado em qualidade e resultados para o seu negócio.`
}

// ─── Ícones Lucide específicos para serviços contábeis ───────
export const SERVICE_ICONS: Record<string, string> = {
  'Abertura e Encerramento de Empresas': 'building',
  'Abertura de Empresas': 'rocket',
  'Encerramento de Empresas': 'folder',
  'Legalização de Empresas': 'badgecheck',
  'Contabilidade Mensal': 'barchart',
  'Contabilidade Digital': 'calculator',
  'Contabilidade Rural': 'spreadsheet',
  'Contabilidade Societária': 'users',
  'Escrituração Fiscal': 'filepen',
  'Gestão Fiscal': 'clipboardcheck',
  'Planejamento Tributário': 'trending',
  'Consultoria Tributária': 'target',
  'Recuperação de Créditos Tributários': 'handcoins',
  'Declaração de Imposto de Renda': 'filetext',
  'Imposto de Renda': 'filetext',
  'Imposto de Renda PF': 'usercheck',
  'Imposto de Renda PJ': 'building2',
  'Folha de Pagamento': 'users',
  'Departamento Pessoal': 'usercog',
  'BPO Financeiro': 'wallet',
  'Obrigações Acessórias': 'clipboardlist',
  'Certidões e Regularizações': 'scroll',
  'Consultoria Empresarial': 'briefcase',
  'Lucro Real / Presumido / Simples': 'scale',
  'Balanços e Demonstrações': 'piechart',
  'Auditoria Contábil': 'search',
  'Perícia Contábil': 'scale',
}

const FALLBACK_ICONS = ['barchart', 'filetext', 'briefcase', 'trending', 'building', 'dollar', 'clipboardlist', 'target', 'scale', 'check']

// ─── Mapeamento ícone Phosphor → emoji (para BentoFeaturesComponent) ─
const ICON_TO_EMOJI: Record<string, string> = {
  barchart: '📊', filetext: '📄', briefcase: '💼', trending: '📈',
  building: '🏛️', building2: '🏢', dollar: '💲', clipboardlist: '📋',
  clipboardcheck: '✅', target: '🎯', scale: '⚖️', check: '✔️',
  users: '👥', wallet: '💰', calculator: '🧮', rocket: '🚀',
  folder: '📁', badgecheck: '🏅', filepen: '📝', scroll: '📜',
  search: '🔍', piechart: '📉', handcoins: '🪙', percent: '💹',
  usercheck: '👤', usercog: '⚙️', star: '⭐', heart: '❤️',
  shield: '🛡️', award: '🏆', clock: '🕐', mail: '✉️',
  phone: '📞', mappin: '📍', globe: '🌐', spreadsheet: '📑',
  receipt: '🧾', creditcard: '💳', banknote: '💵', landmark: '🏦',
}

/** Converte nome de ícone Phosphor para emoji (usado pelo BentoFeaturesComponent). */
export function iconToEmoji(iconName: string): string {
  return ICON_TO_EMOJI[iconName] ?? '📌'
}

/** Retorna o nome do ícone Lucide apropriado para um serviço. */
export function getServiceIcon(nome: string, index: number): string {
  const nomeNormalizado = nome.trim()
  if (SERVICE_ICONS[nomeNormalizado]) return SERVICE_ICONS[nomeNormalizado]

  const nomeLower = nomeNormalizado.toLowerCase()
  if (nomeLower.includes('abertura') || nomeLower.includes('encerramento')) return 'building'
  if (nomeLower.includes('imposto') || nomeLower.includes('irpf') || nomeLower.includes('irpj')) return 'filetext'
  if (nomeLower.includes('folha') || nomeLower.includes('pagamento') || nomeLower.includes('pessoal')) return 'users'
  if (nomeLower.includes('fiscal') || nomeLower.includes('escrituração')) return 'filepen'
  if (nomeLower.includes('tributár') || nomeLower.includes('planejamento')) return 'trending'
  if (nomeLower.includes('bpo') || nomeLower.includes('financeiro')) return 'wallet'
  if (nomeLower.includes('certid') || nomeLower.includes('regulariz')) return 'scroll'
  if (nomeLower.includes('obrigaç') || nomeLower.includes('acessóri')) return 'clipboardlist'
  if (nomeLower.includes('consultoria')) return 'briefcase'
  if (nomeLower.includes('auditoria')) return 'search'
  if (nomeLower.includes('contabil')) return 'barchart'
  if (nomeLower.includes('balanço') || nomeLower.includes('demonstra')) return 'piechart'
  if (nomeLower.includes('recupera') || nomeLower.includes('crédito')) return 'handcoins'

  return FALLBACK_ICONS[index % FALLBACK_ICONS.length]
}

// ─── Segmentos ───────────────────────────────────────────────

export const SEGMENT_ICONS: Record<string, string> = {
  'Agronegócios': '🌾',
  'Startups': '🚀',
  'Farmácias': '💊',
  'Médicos e Saúde': '⚕️',
  'Comércio': '🏪',
  'Construção Civil': '🏗️',
  'Indústria': '🏭',
  'Transportadoras': '🚛',
  'Restaurantes e Alimentação': '🍽️',
  'E-commerce': '🛒',
  'Educação': '🎓',
  'Igrejas e Instituições Religiosas': '⛪',
  'ONGs e Terceiro Setor': '🤝',
  'Prestadores de Serviços': '🔧',
  'Profissionais Liberais': '💼',
  'Condomínios': '🏢',
}

const FALLBACK_SEGMENT_ICONS = ['🏢', '📊', '🎯', '💡', '🌟', '📈']

export const SEGMENT_DESCRIPTIONS: Record<string, string> = {
  'Agronegócios': 'Produtores rurais, cooperativas e empresas do setor agrícola.',
  'Startups': 'Empresas de tecnologia e inovação em fase de crescimento.',
  'Farmácias': 'Drogarias, farmácias de manipulação e distribuidoras.',
  'Médicos e Saúde': 'Clínicas, consultórios e profissionais da área da saúde.',
  'Comércio': 'Lojas, restaurantes e estabelecimentos comerciais.',
  'Construção Civil': 'Construtoras, empreiteiras e prestadores de serviços.',
  'Indústria': 'Fábricas, manufaturas e empresas do setor industrial.',
  'Transportadoras': 'Empresas de transporte, logística e distribuição.',
  'Restaurantes e Alimentação': 'Restaurantes, bares, lanchonetes e serviços de alimentação.',
  'E-commerce': 'Lojas virtuais, marketplaces e comércio eletrônico.',
  'Educação': 'Escolas, cursos, universidades e instituições de ensino.',
  'Igrejas e Instituições Religiosas': 'Igrejas, templos e organizações religiosas.',
  'ONGs e Terceiro Setor': 'Organizações sem fins lucrativos, associações e fundações.',
  'Prestadores de Serviços': 'Empresas e profissionais que oferecem serviços especializados.',
  'Profissionais Liberais': 'Advogados, engenheiros, arquitetos e demais profissionais autônomos.',
  'Condomínios': 'Condomínios residenciais, comerciais e administradoras.',
}

export function getSegmentIcon(nome: string, index: number): string {
  if (SEGMENT_ICONS[nome]) return SEGMENT_ICONS[nome]
  const nomeLower = nome.toLowerCase()
  const match = Object.entries(SEGMENT_ICONS).find(([k]) => nomeLower.includes(k.toLowerCase()) || k.toLowerCase().includes(nomeLower))
  if (match) return match[1]
  return FALLBACK_SEGMENT_ICONS[index % FALLBACK_SEGMENT_ICONS.length]
}

export function getSegmentDescription(nome: string, descricaoUsuario?: string): string {
  if (descricaoUsuario && descricaoUsuario.trim()) return descricaoUsuario
  if (SEGMENT_DESCRIPTIONS[nome]) return SEGMENT_DESCRIPTIONS[nome]
  const match = Object.keys(SEGMENT_DESCRIPTIONS).find(k =>
    nome.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(nome.toLowerCase())
  )
  if (match) return SEGMENT_DESCRIPTIONS[match]
  return `Atendimento especializado para o segmento de ${nome.toLowerCase()}.`
}

// ─── Depoimentos placeholder ────────────────────────────────

export const PLACEHOLDER_DEPOIMENTOS: Depoimento[] = [
  {
    id: 'p1', perfil_empresa_id: '', nome_cliente: 'Carlos Mendes', cargo: 'Empresário',
    citacao: 'Excelente atendimento! A equipe resolveu todas as nossas pendências fiscais com agilidade e transparência. Recomendo muito.',
    nota: 5, foto_url: null, source: 'placeholder', google_review_id: null,
    ativo: true, ordem: 0, created_at: '', updated_at: '',
  },
  {
    id: 'p2', perfil_empresa_id: '', nome_cliente: 'Fernanda Oliveira', cargo: 'Diretora Administrativa',
    citacao: 'Profissionais competentes e sempre disponíveis. Nossa gestão contábil ficou muito mais tranquila desde que contratamos o escritório.',
    nota: 5, foto_url: null, source: 'placeholder', google_review_id: null,
    ativo: true, ordem: 1, created_at: '', updated_at: '',
  },
  {
    id: 'p3', perfil_empresa_id: '', nome_cliente: 'Roberto Costa', cargo: 'Sócio-proprietário',
    citacao: 'Ótima experiência. O planejamento tributário bem feito resultou em economia real para a empresa. Parceria de anos!',
    nota: 5, foto_url: null, source: 'placeholder', google_review_id: null,
    ativo: true, ordem: 2, created_at: '', updated_at: '',
  },
]
