// ─── Sanitizacao: substituir conteudo real por placeholders ──

import type { LayoutNode } from '../types/layout-node.js'

/**
 * Placeholders compativeis com hydrarTemplateComPerfil() do frontend.
 * @see src/features/importar-layout/utils/html-to-template.ts
 */
const HEADING_PLACEHOLDERS: Record<string, string> = {
  h1: 'Seu Titulo Principal',
  h2: 'Titulo da Secao',
  h3: 'Titulo do Item',
  h4: 'Subtitulo',
}

const TEXT_PLACEHOLDER = 'Adicione aqui a descricao do conteudo para esta secao.'
const BUTTON_PLACEHOLDER = 'Saiba Mais'

const NAVBAR_LINKS = [
  'Inicio',
  'Sobre',
  'Servicos',
  'Contato',
]

/**
 * Substitui todo o conteudo real por placeholders.
 * Mantem estilos visuais (fontes, cores, alinhamentos).
 * Garante que nenhum texto, imagem ou link original e preservado.
 */
export function sanitize(layout: LayoutNode): LayoutNode {
  return mapNode(layout)
}

function mapNode(node: LayoutNode): LayoutNode {
  switch (node.kind) {
    case 'Page':
      return { ...node, children: node.children.map(mapNode) }

    case 'Section':
      return { ...node, children: node.children.map(mapNode) }

    case 'Container':
      return { ...node, children: node.children.map(mapNode) }

    case 'Row':
      return { ...node, children: node.children.map(mapNode) }

    case 'Column':
      return { ...node, children: node.children.map(mapNode) }

    case 'Grid':
      return { ...node, children: node.children.map(mapNode) }

    case 'Text':
      return {
        ...node,
        text: HEADING_PLACEHOLDERS[node.variant] || TEXT_PLACEHOLDER,
      }

    case 'Button':
      return {
        ...node,
        text: BUTTON_PLACEHOLDER,
      }

    case 'Image':
      return {
        ...node,
        placeholder: true,
      }

    case 'NavBar':
      return {
        ...node,
        logoChildren: [],
      }

    default:
      return node
  }
}
