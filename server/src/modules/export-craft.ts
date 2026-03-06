// ─── Export: LayoutNode → Craft.js JSON ──────────────────────
//
// Converte a arvore semantica (LayoutNode) para o formato JSON do Craft.js
// compativel com os componentes existentes do editor.
//
// Componentes alvo (resolvedNames):
//   ContainerComponent, TextComponent, HeadingComponent, ButtonComponent,
//   ImageComponent, HeroSectionComponent, FeaturesSectionComponent,
//   NavbarComponent, FooterComponent, CtaSectionComponent,
//   TestimonialsSectionComponent, DividerComponent, VideoComponent
//
// @see src/features/editor/utils/default-templates.ts — buildCraftJson()
// @see src/features/editor/components/user-components/index.ts — resolverMap

import type { LayoutNode, LayoutStyle } from '../types/layout-node.js'
import type { DesignTokens } from '../types/design-tokens.js'
import type { ExtractLayoutResponse } from '../types/api.js'
import { isDark, textColorForBg } from '../utils/color.js'

// ─── TemplateNode (replica do frontend) ──────────────────────

interface TemplateNode {
  type: string
  isCanvas?: boolean
  props: Record<string, unknown>
  displayName?: string
  custom?: Record<string, unknown>
  children?: TemplateNode[]
}

// ─── buildCraftJson (replica exata de default-templates.ts) ──

function buildCraftJson(root: TemplateNode): string {
  const nodes: Record<string, Record<string, unknown>> = {}
  let counter = 0

  function processNode(node: TemplateNode, parentId: string | null): string {
    const nodeId = parentId === null ? 'ROOT' : `node-${++counter}`
    const childIds: string[] = []

    if (node.children) {
      for (const child of node.children) {
        childIds.push(processNode(child, nodeId))
      }
    }

    nodes[nodeId] = {
      type: { resolvedName: node.type },
      isCanvas: node.isCanvas ?? false,
      props: node.props,
      displayName: node.displayName ?? node.type.replace('Component', ''),
      custom: node.custom ?? {},
      hidden: false,
      nodes: childIds,
      linkedNodes: {},
      ...(parentId ? { parent: parentId } : {}),
    }

    return nodeId
  }

  processNode(root, null)
  return JSON.stringify(nodes)
}

// ─── Pipeline principal ──────────────────────────────────────

export function toCraftJson(
  layout: LayoutNode,
  tokens: DesignTokens,
  title: string | null,
): ExtractLayoutResponse {
  if (layout.kind !== 'Page') {
    return {
      success: false,
      craftJson: '',
      colorPalette: tokens.colorPalette,
      fontFamily: tokens.typography.fontFamily,
      sectionCount: 0,
      title,
      error: 'Layout root deve ser Page',
    }
  }

  // Contar secoes
  const sectionCount = layout.children.filter(
    (c) => c.kind === 'Section' || c.kind === 'NavBar',
  ).length

  // Background do root
  const rootBg = tokens.colorPalette.background || '#ffffff'

  // Converter para TemplateNode tree
  const rootTemplate: TemplateNode = {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Pagina',
    props: {
      background: rootBg,
      padding: 0,
      gap: 0,
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      width: '100%',
      height: 'auto',
      shadow: 0,
      radius: 0,
      ...(tokens.typography.fontFamily
        ? { fontFamily: tokens.typography.fontFamily }
        : {}),
    },
    children: layout.children
      .map((child) => layoutToTemplate(child, tokens))
      .filter(Boolean) as TemplateNode[],
  }

  const craftJson = buildCraftJson(rootTemplate)

  return {
    success: true,
    craftJson,
    colorPalette: tokens.colorPalette,
    fontFamily: tokens.typography.fontFamily,
    sectionCount,
    title,
  }
}

// ─── Conversao recursiva ─────────────────────────────────────

function layoutToTemplate(
  node: LayoutNode,
  tokens: DesignTokens,
): TemplateNode | null {
  switch (node.kind) {
    case 'Section':
      return sectionToTemplate(node, tokens)
    case 'NavBar':
      return navbarToTemplate(node, tokens)
    case 'Container':
      return containerToTemplate(node, tokens)
    case 'Row':
      return rowToTemplate(node, tokens)
    case 'Column':
      return columnToTemplate(node, tokens)
    case 'Grid':
      return gridToTemplate(node, tokens)
    case 'Text':
      return textToTemplate(node, tokens)
    case 'Button':
      return buttonToTemplate(node, tokens)
    case 'Image':
      return imageToTemplate(node)
    case 'Page':
      return null // Page e so o root, ja tratado
    default:
      return null
  }
}

// ─── Section ─────────────────────────────────────────────────

function sectionToTemplate(
  node: LayoutNode & { kind: 'Section' },
  tokens: DesignTokens,
): TemplateNode {
  // Usar bg da secao, ou herdar do palette (nunca default para branco puro)
  const bg = node.style.backgroundColor || tokens.colorPalette.background || '#ffffff'
  const children = node.children
    .map((c) => layoutToTemplate(c, tokens))
    .filter(Boolean) as TemplateNode[]

  switch (node.sectionKind) {
    case 'hero': {
      const heroBg = bg || tokens.colorPalette.primary || '#0f172a'
      return {
        type: 'HeroSectionComponent',
        isCanvas: true,
        displayName: 'Hero',
        props: {
          background: heroBg,
          gradientFrom: node.style.gradientFrom || tokens.colorPalette.gradientFrom || '',
          gradientTo: node.style.gradientTo || tokens.colorPalette.gradientTo || '',
          gradientDirection: node.style.gradientDirection || '135deg',
          gradientType: node.style.gradientType || (tokens.colorPalette.gradientType ?? 'linear'),
          paddingY: node.style.paddingY || 80,
          minHeight: node.style.minHeight || 400,
          textAlign: node.style.textAlign || 'center',
        },
        children: ensureHeroContent(children, heroBg, tokens),
      }
    }

    case 'footer': {
      const footerBg = bg || '#111827'
      return {
        type: 'FooterComponent',
        isCanvas: true,
        displayName: 'Rodape',
        props: {
          background: footerBg,
          paddingY: node.style.paddingY || 40,
          columns: Math.min(countDirectContainers(children), 4) || 3,
        },
        children: ensureFooterContent(children, footerBg, tokens),
      }
    }

    case 'cta': {
      const ctaBg = bg || tokens.colorPalette.accent || '#2563eb'
      return {
        type: 'CtaSectionComponent',
        isCanvas: true,
        displayName: 'CTA',
        props: {
          background: ctaBg,
          paddingY: node.style.paddingY || 50,
          radius: node.style.borderRadius || 12,
        },
        children: ensureCtaContent(children, ctaBg, tokens),
      }
    }

    case 'features':
      return {
        type: 'FeaturesSectionComponent',
        isCanvas: true,
        displayName: 'Features',
        props: {
          background: bg,
          columns: detectColumns(children) || 3,
          gap: node.style.gap || 24,
          paddingY: node.style.paddingY || 60,
        },
        children: ensureFeatureCards(children, tokens),
      }

    case 'testimonials':
      return {
        type: 'TestimonialsSectionComponent',
        isCanvas: true,
        displayName: 'Depoimentos',
        props: {
          background: bg,
          columns: detectColumns(children) || 3,
          gap: node.style.gap || 24,
          paddingY: node.style.paddingY || 60,
        },
        children,
      }

    default: {
      // Generic: usar ContainerComponent como secao, mas garantir conteudo minimo
      const enriched = children.length > 0 ? children : ensureGenericContent(tokens, bg)
      return {
        type: 'ContainerComponent',
        isCanvas: true,
        displayName: 'Secao',
        props: {
          background: bg,
          padding: node.style.padding || 0,
          gap: node.style.gap || 16,
          flexDirection: 'column',
          alignItems: node.style.alignItems || 'center',
          justifyContent: node.style.justifyContent || 'flex-start',
          width: '100%',
          height: 'auto',
          shadow: 0,
          radius: 0,
        },
        children: enriched,
      }
    }
  }
}

// ─── NavBar ──────────────────────────────────────────────────

function navbarToTemplate(
  node: LayoutNode & { kind: 'NavBar' },
  tokens: DesignTokens,
): TemplateNode {
  const bg = node.style.backgroundColor || tokens.colorPalette.primary || '#0f172a'
  const linkColor = isDark(bg) ? '#ffffff' : '#374151'
  const ctaBg = tokens.colorPalette.accent || '#f97316'

  const linkCount = node.linkCount || 4
  const links = [
    { label: 'Inicio', href: '#' },
    { label: 'Sobre', href: '#' },
    { label: 'Servicos', href: '#' },
    { label: 'Contato', href: '#' },
  ].slice(0, linkCount)

  return {
    type: 'NavbarComponent',
    displayName: 'Navbar',
    props: {
      background: bg,
      logoText: 'Logo',
      logoSrc: '',
      links,
      ctaText: node.hasCta ? 'Contato' : '',
      ctaBg,
      ctaColor: '#ffffff',
      linkColor,
      paddingX: node.style.paddingX || 40,
      paddingY: node.style.paddingY || 16,
    },
  }
}

// ─── Container ───────────────────────────────────────────────

function containerToTemplate(
  node: LayoutNode & { kind: 'Container' },
  tokens: DesignTokens,
): TemplateNode {
  const children = node.children
    .map((c) => layoutToTemplate(c, tokens))
    .filter(Boolean) as TemplateNode[]

  return {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Container',
    props: {
      background: node.style.backgroundColor || 'transparent',
      padding: node.style.padding || 0,
      gap: node.style.gap || 10,
      flexDirection: node.style.flexDirection || 'column',
      alignItems: node.style.alignItems || 'flex-start',
      justifyContent: node.style.justifyContent || 'flex-start',
      width: node.style.maxWidth || '100%',
      height: 'auto',
      shadow: node.style.boxShadow ? 1 : 0,
      radius: node.style.borderRadius || 0,
    },
    children,
  }
}

// ─── Row ─────────────────────────────────────────────────────

function rowToTemplate(
  node: LayoutNode & { kind: 'Row' },
  tokens: DesignTokens,
): TemplateNode {
  const children = node.children
    .map((c) => layoutToTemplate(c, tokens))
    .filter(Boolean) as TemplateNode[]

  return {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Linha',
    props: {
      background: 'transparent',
      padding: 0,
      gap: node.style.gap || 16,
      flexDirection: 'row',
      alignItems: node.style.alignItems || 'flex-start',
      justifyContent: node.style.justifyContent || 'flex-start',
      width: '100%',
      height: 'auto',
      shadow: 0,
      radius: 0,
    },
    children,
  }
}

// ─── Column ──────────────────────────────────────────────────

function columnToTemplate(
  node: LayoutNode & { kind: 'Column' },
  tokens: DesignTokens,
): TemplateNode {
  const children = node.children
    .map((c) => layoutToTemplate(c, tokens))
    .filter(Boolean) as TemplateNode[]

  return {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Coluna',
    props: {
      background: node.style.backgroundColor || 'transparent',
      padding: node.style.padding || 0,
      gap: node.style.gap || 8,
      flexDirection: 'column',
      alignItems: node.style.alignItems || 'flex-start',
      justifyContent: 'flex-start',
      width: node.style.width || '100%',
      height: 'auto',
      shadow: node.style.boxShadow ? 1 : 0,
      radius: node.style.borderRadius || 0,
    },
    children,
  }
}

// ─── Grid ────────────────────────────────────────────────────

function gridToTemplate(
  node: LayoutNode & { kind: 'Grid' },
  tokens: DesignTokens,
): TemplateNode {
  const children = node.children
    .map((c) => layoutToTemplate(c, tokens))
    .filter(Boolean) as TemplateNode[]

  return {
    type: 'FeaturesSectionComponent',
    isCanvas: true,
    displayName: 'Grid',
    props: {
      background: node.style.backgroundColor || '#ffffff',
      columns: node.columns,
      gap: node.style.gap || 24,
      paddingY: node.style.paddingY || 40,
    },
    children,
  }
}

// ─── Text ────────────────────────────────────────────────────

function textToTemplate(
  node: LayoutNode & { kind: 'Text' },
  tokens: DesignTokens,
): TemplateNode {
  const isHeading = ['h1', 'h2', 'h3', 'h4'].includes(node.variant)

  if (isHeading) {
    return {
      type: 'HeadingComponent',
      displayName: 'Titulo',
      props: {
        text: node.text,
        tagName: node.variant,
        fontSize: String(node.style.fontSize || getDefaultFontSize(node.variant)),
        textAlign: node.style.textAlign || 'left',
        fontWeight: node.style.fontWeight || '700',
        color: node.style.color || tokens.colorPalette.text || '#111827',
      },
    }
  }

  return {
    type: 'TextComponent',
    displayName: 'Texto',
    props: {
      text: node.text,
      fontSize: String(node.style.fontSize || 16),
      textAlign: node.style.textAlign || 'left',
      fontWeight: node.style.fontWeight || '400',
      color: node.style.color || tokens.colorPalette.text || '#333333',
      margin: [0, 0, 0, 0],
    },
  }
}

// ─── Button ──────────────────────────────────────────────────

function buttonToTemplate(
  node: LayoutNode & { kind: 'Button' },
  tokens: DesignTokens,
): TemplateNode {
  const bg = node.style.backgroundColor || tokens.colorPalette.accent || '#2563eb'
  const color = node.style.color || textColorForBg(bg)

  return {
    type: 'ButtonComponent',
    displayName: 'Botao',
    props: {
      text: node.text,
      href: '#',
      buttonStyle: 'filled',
      size: 'md',
      background: bg,
      color,
      borderRadius: node.style.borderRadius || 8,
    },
  }
}

// ─── Image ───────────────────────────────────────────────────

function imageToTemplate(
  node: LayoutNode & { kind: 'Image' },
): TemplateNode {
  return {
    type: 'ImageComponent',
    displayName: 'Imagem',
    props: {
      src: '',
      alt: 'Imagem',
      width: node.style.width || '100%',
      height: node.style.height || 'auto',
      objectFit: 'cover',
      borderRadius: node.style.borderRadius || 0,
    },
  }
}

// ─── Helpers: garantir conteudo minimo ───────────────────────

function ensureHeroContent(
  children: TemplateNode[],
  bg: string,
  tokens: DesignTokens,
): TemplateNode[] {
  if (children.length > 0) return children

  // Hero vazio: adicionar heading + texto + botao
  const textColor = isDark(bg) ? '#ffffff' : '#111827'
  return [
    {
      type: 'HeadingComponent',
      displayName: 'Titulo',
      props: {
        text: 'Seu Titulo Principal',
        tagName: 'h1',
        fontSize: '48',
        textAlign: 'center',
        fontWeight: '700',
        color: textColor,
      },
    },
    {
      type: 'TextComponent',
      displayName: 'Texto',
      props: {
        text: 'Adicione aqui a descricao do conteudo para esta secao.',
        fontSize: '18',
        textAlign: 'center',
        fontWeight: '400',
        color: textColor,
        margin: [16, 0, 24, 0],
      },
    },
    {
      type: 'ButtonComponent',
      displayName: 'Botao',
      props: {
        text: 'Saiba Mais',
        href: '#',
        buttonStyle: 'filled',
        size: 'lg',
        background: tokens.colorPalette.accent || '#f97316',
        color: '#ffffff',
        borderRadius: 8,
      },
    },
  ]
}

function ensureFooterContent(
  children: TemplateNode[],
  bg: string,
  tokens: DesignTokens,
): TemplateNode[] {
  if (children.length > 0) return children

  const textColor = isDark(bg) ? '#d1d5db' : '#374151'
  return [
    {
      type: 'TextComponent',
      displayName: 'Texto',
      props: {
        text: '© 2024 Sua Empresa. Todos os direitos reservados.',
        fontSize: '14',
        textAlign: 'center',
        fontWeight: '400',
        color: textColor,
        margin: [0, 0, 0, 0],
      },
    },
  ]
}

function ensureCtaContent(
  children: TemplateNode[],
  bg: string,
  tokens: DesignTokens,
): TemplateNode[] {
  if (children.length > 0) return children

  const textColor = isDark(bg) ? '#ffffff' : '#111827'
  return [
    {
      type: 'HeadingComponent',
      displayName: 'Titulo',
      props: {
        text: 'Titulo da Secao',
        tagName: 'h2',
        fontSize: '36',
        textAlign: 'center',
        fontWeight: '700',
        color: textColor,
      },
    },
    {
      type: 'ButtonComponent',
      displayName: 'Botao',
      props: {
        text: 'Saiba Mais',
        href: '#',
        buttonStyle: 'filled',
        size: 'lg',
        background: '#ffffff',
        color: bg,
        borderRadius: 8,
      },
    },
  ]
}

function ensureFeatureCards(
  children: TemplateNode[],
  tokens: DesignTokens,
): TemplateNode[] {
  if (children.length >= 2) return children

  // Gerar 3 cards placeholder
  return Array.from({ length: 3 }, (_, i) => ({
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: `Card ${i + 1}`,
    props: {
      background: '#ffffff',
      padding: 24,
      gap: 12,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      width: '100%',
      height: 'auto',
      shadow: 1,
      radius: 12,
    },
    children: [
      {
        type: 'HeadingComponent',
        displayName: 'Titulo',
        props: {
          text: 'Titulo do Item',
          tagName: 'h3',
          fontSize: '20',
          textAlign: 'center',
          fontWeight: '600',
          color: '#111827',
        },
      },
      {
        type: 'TextComponent',
        displayName: 'Texto',
        props: {
          text: 'Adicione aqui a descricao do conteudo para esta secao.',
          fontSize: '14',
          textAlign: 'center',
          fontWeight: '400',
          color: '#6b7280',
          margin: [0, 0, 0, 0],
        },
      },
    ],
  }))
}

// ─── Utils ───────────────────────────────────────────────────

function getDefaultFontSize(variant: string): number {
  switch (variant) {
    case 'h1': return 48
    case 'h2': return 36
    case 'h3': return 24
    case 'h4': return 20
    default: return 16
  }
}

function detectColumns(children: TemplateNode[]): number {
  // Contar filhos que sao containers (cards)
  const containers = children.filter(
    (c) => c.type === 'ContainerComponent' && c.isCanvas,
  )
  if (containers.length >= 2 && containers.length <= 6) {
    return containers.length
  }
  return 0
}

function countDirectContainers(children: TemplateNode[]): number {
  return children.filter(
    (c) => c.type === 'ContainerComponent' && c.isCanvas,
  ).length
}

function ensureGenericContent(
  tokens: DesignTokens,
  bg: string,
): TemplateNode[] {
  const textColor = isDark(bg) ? '#ffffff' : '#111827'
  const subColor = isDark(bg) ? '#d1d5db' : '#6b7280'

  return [
    {
      type: 'HeadingComponent',
      displayName: 'Titulo',
      props: {
        text: 'Titulo da Secao',
        tagName: 'h2',
        fontSize: '32',
        textAlign: 'center',
        fontWeight: '700',
        color: textColor,
      },
    },
    {
      type: 'TextComponent',
      displayName: 'Texto',
      props: {
        text: 'Adicione aqui a descricao do conteudo para esta secao.',
        fontSize: '16',
        textAlign: 'center',
        fontWeight: '400',
        color: subColor,
        margin: [8, 0, 0, 0],
      },
    },
  ]
}
