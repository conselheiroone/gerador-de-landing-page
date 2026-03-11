import { z } from 'zod'

function cnpjFormat(value: string) {
  const digits = value.replace(/\D/g, '')
  return digits.length === 0 || digits.length === 14
}

function cepFormat(value: string) {
  const digits = value.replace(/\D/g, '')
  return digits.length === 0 || digits.length === 8
}

export const dadosEscritorioSchema = z.object({
  nome_empresa: z.string().min(2, 'Nome da empresa é obrigatório'),
  cnpj: z.string().refine(cnpjFormat, 'CNPJ deve ter 14 dígitos').optional().or(z.literal('')),
  tipo_escritorio: z.enum(['individual', 'sociedade'], {
    message: 'Selecione o tipo do escritório',
  }),
  slogan: z.string().optional().or(z.literal('')),
  ano_fundacao: z.string().optional().or(z.literal('')),
})

export const socioSchema = z.object({
  nome_completo: z.string().min(2, 'Nome é obrigatório'),
  crc_numero: z.string().optional().or(z.literal('')),
  crc_estado: z.string().optional().or(z.literal('')),
  cargo: z.string().optional().or(z.literal('')),
  foto_url: z.string().optional().or(z.literal('')),
  especialidades: z.array(z.string()).default([]),
  mini_bio: z.string().optional().or(z.literal('')),
  exibir_landing_page: z.boolean().default(true),
  ordem: z.number().default(0),
})

export const sociosSchema = z.object({
  socios: z.array(socioSchema).min(1, 'Adicione pelo menos um sócio/contador'),
})

export const contatoLocalizacaoSchema = z.object({
  telefone: z.string().optional().or(z.literal('')),
  whatsapp: z.string().optional().or(z.literal('')),
  email_contato: z.string().email('Email inválido').optional().or(z.literal('')),
  horario_atendimento: z.string().optional().or(z.literal('')),
  cep: z.string().refine(cepFormat, 'CEP deve ter 8 dígitos').optional().or(z.literal('')),
  logradouro: z.string().optional().or(z.literal('')),
  numero: z.string().optional().or(z.literal('')),
  complemento: z.string().optional().or(z.literal('')),
  bairro: z.string().optional().or(z.literal('')),
  cidade: z.string().optional().or(z.literal('')),
  estado: z.string().optional().or(z.literal('')),
})

export const identidadeVisualSchema = z.object({
  logo_url: z.string().optional().or(z.literal('')),
  cor_primaria: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida').default('#10B981'),
  cor_secundaria: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida').default('#1A1A1A'),
})

export const sobreEscritorioSchema = z.object({
  historia: z.string().optional().or(z.literal('')),
  missao: z.string().optional().or(z.literal('')),
  visao: z.string().optional().or(z.literal('')),
  valores: z.string().optional().or(z.literal('')),
  diferenciais: z.array(z.string()).default([]),
  google_place_id: z.string().optional().or(z.literal('')),
})

export const servicoItemSchema = z.object({
  nome: z.string().min(1, 'Nome do serviço é obrigatório'),
  descricao: z.string().optional().or(z.literal('')),
})

export const servicosSchema = z.object({
  servicos: z.array(servicoItemSchema).default([]),
})

export const segmentoItemSchema = z.object({
  nome: z.string().min(1, 'Nome do segmento é obrigatório'),
  descricao: z.string().optional().or(z.literal('')),
})

export const segmentosSchema = z.object({
  segmentos: z.array(segmentoItemSchema).default([]),
})

export const redesSociaisSchema = z.object({
  instagram: z.string().optional().or(z.literal('')),
  facebook: z.string().optional().or(z.literal('')),
  linkedin: z.string().optional().or(z.literal('')),
  youtube: z.string().optional().or(z.literal('')),
  site: z.string().optional().or(z.literal('')),
  twitter: z.string().optional().or(z.literal('')),
})

export type DadosEscritorioInput = z.infer<typeof dadosEscritorioSchema>
export type SocioInput = z.infer<typeof socioSchema>
export type ContatoLocalizacaoInput = z.infer<typeof contatoLocalizacaoSchema>
export type IdentidadeVisualInput = z.infer<typeof identidadeVisualSchema>
export type SobreEscritorioInput = z.infer<typeof sobreEscritorioSchema>
export type ServicosInput = z.infer<typeof servicosSchema>
export type SegmentosInput = z.infer<typeof segmentosSchema>
export type RedesSociaisInput = z.infer<typeof redesSociaisSchema>
