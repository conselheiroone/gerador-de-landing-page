export type UserRole = 'admin' | 'avancado' | 'cliente'

export type UserStatus = 'ativo' | 'suspenso' | 'pendente'

export interface UserProfile {
  id: string
  email: string
  nome: string | null
  empresa: string | null
  logo_url: string | null
  avatar_url: string | null
  telefone: string | null
  cargo: string | null
  status: UserStatus
  role: UserRole
}

export interface TemplateSecaoProp {
  valor: unknown
  tipo: 'text' | 'image' | 'color' | 'select' | 'array' | 'number' | 'boolean'
  editavel_cliente: boolean
  opcoes?: string[]
}

export interface TemplateSecao {
  id: string
  tipo: string
  componente: string
  ordem: number
  props: Record<string, TemplateSecaoProp>
}

export interface TemplateDados {
  secoes: TemplateSecao[]
  config_global: {
    fonte: string
    cor_primaria: string
    cor_secundaria: string
  }
}
