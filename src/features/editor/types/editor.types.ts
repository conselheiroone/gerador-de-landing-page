export interface ProjetoEditor {
  id: string
  nome: string
  json_estado: string
  template_id?: string
  usuario_id: string
  created_at: string
  updated_at: string
}

export interface ComponenteMeta {
  displayName: string
  icon: string
  category: 'basico' | 'secao' | 'layout'
  description: string
}

export type CraftColor = {
  r: number
  g: number
  b: number
  a: number
}
