import { buildCraftJson, type TemplateNode } from '@/features/editor/utils/default-templates'
import type {
  ColorPalette,
  DomLayoutNode,
  ElementStyle,
  FetchHtmlResponse,
  ImportResult,
  ParsedSection,
  SectionType,
} from '../types/importar-layout.types'

// ─── Color Resolution ─────────────────────────────────────────

interface ResolvedColors {
  bg: string
  heading: string
  text: string
  subtext: string
  cardBg: string
  shadow: number
  accentColor: string
}

/**
 * Resolve a paleta de cores para uma seção.
 * Usa cores reais extraídas do HTML quando disponíveis,
 * com fallback inteligente por tone.
 */
function resolveColors(
  section: ParsedSection,
  palette: ColorPalette | null,
  sectionIndex: number,
): ResolvedColors {
  const accent = palette?.accent ?? '#2563eb'
  const paletteIsDark = palette?.primary ? isDarkColor(palette.primary) : false

  // Cor de fundo: actualBgColor > palette.primary/bg > tone fallback
  let bg: string
  if (section.actualBgColor) {
    bg = section.actualBgColor
  } else if (section.backgroundTone === 'dark') {
    bg = palette?.primary ?? '#0f172a'
  } else if (section.backgroundTone === 'accent') {
    bg = accent
  } else if (section.backgroundTone === 'light') {
    // Se a paleta do site é escura, usar cores escuras alternadas para melhor fidelidade
    if (paletteIsDark && palette?.primary) {
      bg = sectionIndex % 2 === 0 ? palette.primary : (palette.background ?? lightenHex(palette.primary, 15))
    } else {
      bg = sectionIndex % 2 === 0 ? '#ffffff' : '#f8fafc'
    }
  } else {
    // unknown: se a paleta do site tem cor primária escura, usar ela como base
    if (paletteIsDark && palette?.primary) {
      bg = sectionIndex % 2 === 0 ? palette.primary : (palette.background ?? lightenHex(palette.primary, 10))
    } else {
      bg = sectionIndex % 2 === 0 ? '#ffffff' : '#f8fafc'
    }
  }

  // Determina se o fundo é escuro para derivar cores de texto
  const isDark = isDarkColor(bg)
  const isAccentBg = !isDark && isColorful(bg)

  if (isDark || isAccentBg) {
    return {
      bg,
      heading: '#ffffff',
      text: '#e2e8f0',
      subtext: '#94a3b8',
      cardBg: isDark ? lightenHex(bg, 15) : 'rgba(255,255,255,0.15)',
      shadow: 0,
      accentColor: accent,
    }
  }

  return {
    bg,
    heading: '#111827',
    text: '#4b5563',
    subtext: '#6b7280',
    cardBg: '#ffffff',
    shadow: 2,
    accentColor: accent,
  }
}

/** Verifica se uma cor hex é escura (luminância < 0.45) */
function isDarkColor(hex: string): boolean {
  if (!hex.startsWith('#')) return false
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  const r = parseInt(full.substring(0, 2), 16)
  const g = parseInt(full.substring(2, 4), 16)
  const b = parseInt(full.substring(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.45
}

/** Verifica se uma cor é saturada/colorida (accent) */
function isColorful(hex: string): boolean {
  if (!hex.startsWith('#')) return false
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  const r = parseInt(full.substring(0, 2), 16)
  const g = parseInt(full.substring(2, 4), 16)
  const b = parseInt(full.substring(4, 6), 16)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  return max > 0 && (max - min) / max > 0.3
}

/** Clareia um hex em N pontos (para cardBg em fundos escuros) */
function lightenHex(hex: string, amount: number): string {
  if (!hex.startsWith('#')) return '#1e293b'
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  const r = Math.min(255, parseInt(full.substring(0, 2), 16) + amount)
  const g = Math.min(255, parseInt(full.substring(2, 4), 16) + amount)
  const b = Math.min(255, parseInt(full.substring(4, 6), 16) + amount)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// ─── Text Helpers (sempre placeholder — nunca texto real do site) ────────────

/** Retorna SEMPRE o fallback — nunca textos reais do site clonado */
function heading(_section: ParsedSection, fallback: string, _index = 0): string {
  return fallback
}

/** Retorna SEMPRE o fallback */
function ctaText(_section: ParsedSection, fallback: string): string {
  return fallback
}

/** Retorna SEMPRE o fallback */
function paragraphText(_section: ParsedSection, fallback: string): string {
  return fallback
}

// ─── DOM → Craft.js Converter ────────────────────────────────

/** Placeholders por tag — nunca usa conteúdo real do site */
const PLACEHOLDER_TEXT: Record<string, string> = {
  h1: 'Seu Título Principal',
  h2: 'Título da Seção',
  h3: 'Título do Item',
  h4: 'Subtítulo',
  h5: 'Texto',
  h6: 'Texto',
  p: 'Adicione aqui a descrição do conteúdo para esta seção.',
  li: 'Item da lista',
  span: 'Texto',
  a: 'Saiba Mais',
  button: 'Clique Aqui',
  label: 'Campo',
  strong: 'Destaque importante',
  em: 'Texto em destaque',
  b: 'Destaque',
  small: 'Informação adicional',
  dt: 'Termo',
  dd: 'Definição',
  td: 'Dado',
  th: 'Cabeçalho',
}

/** Converte valor CSS com unidade em número (px/rem/em → px) */
function cssValueToNumber(value: string | undefined, base = 16): number | undefined {
  if (!value) return undefined
  const n = parseFloat(value)
  if (isNaN(n)) return undefined
  if (value.endsWith('rem')) return Math.round(n * base)
  if (value.endsWith('em')) return Math.round(n * base)
  if (value.endsWith('px')) return Math.round(n)
  if (value.endsWith('%') || value === 'auto') return undefined
  return Math.round(n)
}

/** Reduz estilos de texto para props do Craft.js */
function reduceTextStyle(style: ElementStyle): {
  fontSize?: number; fontWeight?: string; color?: string; textAlign?: string
} {
  return {
    fontSize: cssValueToNumber(style.fontSize),
    fontWeight: style.fontWeight,
    // Apenas cores hex válidas — evitar 'inherit', 'currentColor', etc.
    color: style.color?.startsWith('#') ? style.color : undefined,
    textAlign: ['left', 'center', 'right', 'justify'].includes(style.textAlign ?? '')
      ? style.textAlign as 'left' | 'center' | 'right'
      : undefined,
  }
}

/** Reduz estilos de container para props do ContainerComponent */
function reduceContainerStyle(style: ElementStyle): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  if (style.flexDirection) result.flexDirection = style.flexDirection
  if (style.justifyContent) result.justifyContent = style.justifyContent
  if (style.alignItems) result.alignItems = style.alignItems

  if (style.gap) {
    const n = cssValueToNumber(style.gap)
    if (n !== undefined) result.gap = Math.min(n, 80)
  }

  // Padding: usa o primeiro valor disponível
  const firstPad = [style.paddingTop, style.padding].find(Boolean)
  if (firstPad) {
    const n = cssValueToNumber(firstPad.split(' ')[0])
    if (n !== undefined) result.padding = Math.min(n, 120)
  }

  // Background: apenas cores sólidas hex (não gradientes)
  const bg = style.backgroundColor || style.background
  if (bg?.startsWith('#')) result.background = bg

  if (style.borderRadius) {
    const n = cssValueToNumber(style.borderRadius.split(' ')[0])
    if (n !== undefined) result.radius = Math.min(n, 48)
  }

  if (style.minHeight) {
    const n = cssValueToNumber(style.minHeight)
    if (n !== undefined) result.minHeight = Math.min(n, 900)
  }

  return result
}

/** Reduz estilos de imagem para props do ImageComponent */
function reduceImageStyle(style: ElementStyle): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  if (style.width && !style.width.includes('%')) {
    const n = cssValueToNumber(style.width)
    if (n) result.width = n
  }
  if (style.height && !style.height.includes('%')) {
    const n = cssValueToNumber(style.height)
    if (n) result.height = n
  }
  if (style.borderRadius) {
    const n = cssValueToNumber(style.borderRadius.split(' ')[0])
    if (n !== undefined) result.borderRadius = n
  }
  if (style.objectFit) result.objectFit = style.objectFit
  return result
}

/** Infere número de colunas de grid a partir do grid-template-columns */
function inferGridColumns(gridTemplateColumns: string | undefined): number {
  if (!gridTemplateColumns) return 3
  const repeatMatch = gridTemplateColumns.match(/repeat\((\d+)/)
  if (repeatMatch) return Math.min(parseInt(repeatMatch[1]), 6)
  const parts = gridTemplateColumns.trim().split(/\s+/).filter(Boolean)
  return Math.max(1, Math.min(parts.length, 6))
}

const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
const TEXT_LEAF_TAGS = new Set(['p', 'span', 'li', 'strong', 'em', 'b', 'i', 'small', 'label', 'dt', 'dd'])
const DEFAULT_HEADING_SIZES: Record<string, number> = { h1: 44, h2: 36, h3: 28, h4: 22, h5: 18, h6: 16 }

/**
 * Converte um DomLayoutNode em TemplateNode do Craft.js.
 * NUNCA usa textos reais do site — apenas placeholders.
 */
function domNodeToCraft(node: DomLayoutNode, palette: ColorPalette | null): TemplateNode {
  const { tag, style, children } = node

  // ── Imagem ──────────────────────────────────────────────────
  if (tag === 'img' || node.src !== undefined) {
    const imgStyle = reduceImageStyle(style)
    return {
      type: 'ImageComponent',
      props: {
        src: '',
        alt: '',
        width: typeof imgStyle.width === 'number' ? imgStyle.width : 200,
        height: typeof imgStyle.height === 'number' ? imgStyle.height : 150,
        borderRadius: typeof imgStyle.borderRadius === 'number' ? imgStyle.borderRadius : 0,
        objectFit: typeof imgStyle.objectFit === 'string' ? imgStyle.objectFit : 'cover',
      },
    }
  }

  // ── SVG / ícone ──────────────────────────────────────────────
  if (tag === 'svg') {
    return {
      type: 'ImageComponent',
      props: { src: '', alt: 'ícone', width: 48, height: 48, borderRadius: 0, objectFit: 'contain' },
    }
  }

  // ── Headings ─────────────────────────────────────────────────
  if (HEADING_TAGS.has(tag)) {
    const ts = reduceTextStyle(style)
    return {
      type: 'HeadingComponent',
      props: {
        text: PLACEHOLDER_TEXT[tag] ?? 'Título',
        tagName: tag,
        fontSize: String(ts.fontSize ?? DEFAULT_HEADING_SIZES[tag] ?? 24),
        fontWeight: ts.fontWeight ?? '700',
        ...(ts.color ? { color: ts.color } : {}),
        ...(ts.textAlign ? { textAlign: ts.textAlign } : {}),
      },
    }
  }

  // ── Botão / Link CTA (sem filhos) ────────────────────────────
  if ((tag === 'button' || tag === 'a') && children.length === 0) {
    return {
      type: 'ButtonComponent',
      props: {
        text: PLACEHOLDER_TEXT[tag] ?? 'Saiba Mais',
        href: '#',
        background: palette?.accent ?? '#2563eb',
        color: '#ffffff',
        borderRadius: 8,
        size: 'md',
        buttonStyle: 'filled',
      },
    }
  }

  // ── Texto folha ──────────────────────────────────────────────
  if (TEXT_LEAF_TAGS.has(tag) && children.length === 0) {
    const ts = reduceTextStyle(style)
    return {
      type: 'TextComponent',
      props: {
        text: PLACEHOLDER_TEXT[tag] ?? '[Texto]',
        fontSize: String(ts.fontSize ?? 16),
        fontWeight: ts.fontWeight ?? '400',
        ...(ts.color ? { color: ts.color } : {}),
        ...(ts.textAlign ? { textAlign: ts.textAlign } : {}),
        margin: [0, 0, 8, 0],
      },
    }
  }

  // ── Container com filhos ─────────────────────────────────────
  const display = style.display ?? 'block'
  const isGrid = display === 'grid' || display === 'inline-grid'
  const isFlex = display === 'flex' || display === 'inline-flex'
  const cs = reduceContainerStyle(style)

  const craftChildren = children
    .map((child) => domNodeToCraft(child, palette))
    .filter(Boolean) as TemplateNode[]

  // Grid → FeaturesSectionComponent
  if (isGrid) {
    const cols = inferGridColumns(style.gridTemplateColumns)
    return {
      type: 'FeaturesSectionComponent',
      isCanvas: true,
      props: {
        columns: cols,
        gap: typeof cs.gap === 'number' ? cs.gap : 24,
        background: typeof cs.background === 'string' ? cs.background : 'transparent',
        paddingY: typeof cs.padding === 'number' ? cs.padding : 0,
      },
      children: craftChildren,
    }
  }

  // Flex ou block → ContainerComponent
  return {
    type: 'ContainerComponent',
    isCanvas: true,
    props: {
      flexDirection: isFlex ? (style.flexDirection ?? 'row') : 'column',
      justifyContent: style.justifyContent ?? 'flex-start',
      alignItems: style.alignItems ?? 'flex-start',
      gap: typeof cs.gap === 'number' ? cs.gap : 0,
      background: typeof cs.background === 'string' ? cs.background : 'transparent',
      padding: typeof cs.padding === 'number' ? cs.padding : 0,
      radius: typeof cs.radius === 'number' ? cs.radius : 0,
      shadow: 0,
      width: '100%',
      height: 'auto',
      ...(typeof cs.minHeight === 'number' ? { minHeight: cs.minHeight } : {}),
    },
    children: craftChildren,
  }
}

/**
 * Constrói um nó de seção clonando fielmente a estrutura DOM.
 * Usa ContainerComponent com fundo correto da paleta como wrapper.
 * Fallback: usa o builder semântico existente.
 */
/**
 * Verifica se os nós gerados a partir do DOM têm estrutura rica suficiente
 * para valer a pena usar em vez do builder semântico.
 *
 * Sites com CSS externo (Tailwind CDN, Bootstrap) frequentemente têm resolução
 * de classes vazia, gerando árvores muito planas. Nesses casos o builder
 * semântico produz resultado visual muito superior.
 */
function domTreeHasRichStructure(craftChildren: TemplateNode[], section: ParsedSection): boolean {
  if (craftChildren.length === 0) return false

  // Qualquer container ou grid → estrutura rica detectada
  const hasContainerOrGrid = craftChildren.some(
    (c) => c.type === 'ContainerComponent' || c.type === 'FeaturesSectionComponent',
  )
  if (hasContainerOrGrid) return true

  // Seções de grid (features, testimonials, logos, gallery) precisam de estrutura com containers
  const gridSections = new Set<SectionType>(['features', 'testimonials', 'logos', 'gallery'])
  if (gridSections.has(section.sectionType)) return false

  // Seções textuais (hero, cta, about, contact, faq) aceitam elementos planos desde que tenham 2+
  return craftChildren.length >= 2
}

/**
 * Constrói um nó de seção clonando fielmente a estrutura DOM.
 * Se o DOM tree for esparso (CSS externo não resolvido), cai no builder semântico.
 */
function buildSectionFromDomTree(
  section: ParsedSection,
  sectionIndex: number,
  palette: ColorPalette | null,
): TemplateNode {
  const colors = resolveColors(section, palette, sectionIndex)
  const domNode = section.domTree!

  // Converter filhos do DOM em nós Craft
  const craftChildren = domNode.children
    .map((child) => domNodeToCraft(child, palette))
    .filter(Boolean) as TemplateNode[]

  // Se o DOM tree não gerou estrutura suficiente → usar builder semântico
  // (ocorre quando o site usa CSS externo que não foi resolvido)
  if (!domTreeHasRichStructure(craftChildren, section)) {
    return sectionBuilders[section.sectionType](section, sectionIndex, palette)
  }

  const cs = reduceContainerStyle(domNode.style)
  // Cor de fundo: prioriza cor real do DOM, depois paleta resolvida
  const bg = (typeof cs.background === 'string' ? cs.background : null) ?? colors.bg

  // Seção wrapper full-width com fundo correto
  return {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: section.displayNameHint?.substring(0, 30) ?? section.sectionType,
    props: {
      background: bg,
      padding: 0,
      gap: 0,
      width: '100%',
      height: 'auto',
      flexDirection: 'column',
      alignItems: 'stretch',
      justifyContent: 'flex-start',
      shadow: 0,
      radius: 0,
    },
    children: [
      {
        type: 'ContainerComponent',
        isCanvas: true,
        displayName: 'Conteudo',
        props: {
          background: 'transparent',
          padding: typeof cs.padding === 'number' ? cs.padding : 60,
          gap: typeof cs.gap === 'number' ? cs.gap : 0,
          width: '100%',
          height: 'auto',
          flexDirection: domNode.style.flexDirection ?? 'column',
          alignItems: domNode.style.alignItems ?? 'center',
          justifyContent: domNode.style.justifyContent ?? 'center',
          shadow: 0,
          radius: 0,
        },
        children: craftChildren,
      },
    ],
  }
}

// ─── Navbar ──────────────────────────────────────────────────

function buildNavbarSection(section: ParsedSection, palette: ColorPalette | null): TemplateNode {
  const bg = section.actualBgColor ?? palette?.primary ?? '#0f172a'
  const linkColor = isDarkColor(bg) ? '#ffffff' : '#111827'
  const ctaBg = palette?.accent ?? '#f97316'

  // Extrair até 4 textos de links da seção (headingTexts tendem a ser os títulos dos links)
  const defaultLinks = [
    { label: 'Início', href: '#' },
    { label: 'Sobre', href: '#' },
    { label: 'Serviços', href: '#' },
    { label: 'Contato', href: '#' },
  ]

  return {
    type: 'NavbarComponent',
    isCanvas: false,
    displayName: 'Navbar',
    props: {
      background: bg,
      logoText: 'Logo',
      logoSrc: '',
      links: defaultLinks,
      ctaText: ctaText(section, 'Contato'),
      ctaBg,
      ctaColor: '#ffffff',
      linkColor,
      paddingX: 40,
      paddingY: 16,
    },
  }
}

// ─── Hero ─────────────────────────────────────────────────────

function buildHeroSection(section: ParsedSection, palette: ColorPalette | null): TemplateNode {
  const colors = resolveColors(section, palette, 0)

  // Gradient: usa dados reais do palette quando disponíveis
  // Se o site tem gradiente detectado → usamos. Se não → deixamos vazio (cor sólida)
  const hasGradient = !!(palette?.gradientFrom && palette?.gradientTo)
  const gradientFrom = hasGradient ? (palette!.gradientFrom as string) : ''
  const gradientTo = hasGradient ? (palette!.gradientTo as string) : ''
  const gradientType = palette?.gradientType ?? 'linear'
  const gradientDirection = palette?.gradientDirection ?? '135deg'

  const children: TemplateNode[] = [
    {
      type: 'HeadingComponent',
      displayName: 'Titulo',
      props: {
        text: heading(section, 'Título Principal'),
        tagName: 'h1',
        fontSize: '44',
        fontWeight: '800',
        textAlign: 'center',
        color: colors.heading,
      },
    },
    {
      type: 'TextComponent',
      displayName: 'Subtitulo',
      props: {
        text: paragraphText(section, 'Descrição da empresa. Edite este texto com suas informações.'),
        fontSize: '18',
        fontWeight: '400',
        textAlign: 'center',
        color: colors.text,
        margin: [8, 0, 24, 0],
      },
    },
  ]

  // CTA aparece antes do vídeo
  if (section.contentInventory.buttonCount > 0) {
    children.push({
      type: 'ButtonComponent',
      displayName: 'CTA',
      props: {
        text: ctaText(section, 'Saiba Mais'),
        href: '#',
        background: colors.accentColor,
        color: '#ffffff',
        size: 'lg',
        buttonStyle: 'filled',
        borderRadius: 8,
      },
    })
  }

  // Vídeo detectado: adiciona VideoComponent como placeholder
  if (section.hasVideo) {
    children.push({
      type: 'VideoComponent',
      isCanvas: false,
      displayName: 'Video',
      props: {
        url: '',
        width: '100%',
        height: '400px',
        borderRadius: 12,
        background: lightenHex(colors.bg, 10),
      },
    })
  }

  return {
    type: 'HeroSectionComponent',
    isCanvas: true,
    displayName: 'Hero',
    props: {
      background: colors.bg,
      gradientFrom,
      gradientTo,
      gradientType,
      gradientDirection,
      paddingY: 80,
      minHeight: 400,
      textAlign: 'center',
    },
    children,
  }
}

// ─── Features / Services ──────────────────────────────────────

function buildFeaturesSection(section: ParsedSection, sectionIndex: number, palette: ColorPalette | null): TemplateNode {
  const itemCount = section.repeatedItems?.count ?? Math.max(section.childCount, 3)
  const columns = section.layout.columns > 1 ? section.layout.columns : Math.min(itemCount, 3)
  const colors = resolveColors(section, palette, sectionIndex)
  const hasImage = section.repeatedItems?.itemStructure.hasImage ?? false

  const headerContainer: TemplateNode = {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Cabeçalho',
    props: {
      background: 'transparent',
      padding: 0,
      gap: 8,
      width: '100%',
      height: 'auto',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      shadow: 0,
      radius: 0,
    },
    children: [
      {
        type: 'HeadingComponent',
        displayName: 'Titulo Secao',
        props: {
          text: heading(section, 'Nossos Serviços'),
          tagName: 'h2',
          fontSize: '32',
          fontWeight: '700',
          textAlign: 'center',
          color: colors.heading,
        },
      },
      {
        type: 'DividerComponent',
        displayName: 'Divisor',
        props: { color: colors.accentColor, thickness: 3, marginY: 8, style: 'solid' },
      },
    ],
  }

  const cards: TemplateNode[] = Array.from({ length: Math.min(itemCount, 8) }, (_, i) => {
    const cardChildren: TemplateNode[] = []

    if (hasImage) {
      cardChildren.push({
        type: 'ImageComponent',
        displayName: 'Imagem',
        props: {
          src: '',
          alt: `Serviço ${i + 1}`,
          width: '100%',
          height: '160px',
          objectFit: 'cover',
          borderRadius: 0,
        },
      })
    }

    cardChildren.push(
      {
        type: 'HeadingComponent',
        displayName: 'Titulo',
        props: {
          text: section.headingTexts[i + 1] ?? `Serviço ${i + 1}`,
          tagName: 'h3',
          fontSize: '18',
          fontWeight: '700',
          textAlign: 'left',
          color: colors.heading,
        },
      },
      {
        type: 'TextComponent',
        displayName: 'Descrição',
        props: {
          text: 'Descrição do serviço. Edite com suas informações.',
          fontSize: '14',
          fontWeight: '400',
          textAlign: 'left',
          color: colors.subtext,
          margin: [0, 0, 0, 0],
        },
      },
    )

    return {
      type: 'ContainerComponent',
      isCanvas: true,
      displayName: `Card ${i + 1}`,
      props: {
        background: colors.cardBg,
        padding: hasImage ? 0 : 24,
        gap: 8,
        width: '100%',
        height: 'auto',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        shadow: colors.shadow,
        radius: 12,
      },
      children: cardChildren,
    }
  })

  return {
    type: 'FeaturesSectionComponent',
    isCanvas: true,
    displayName: 'Serviços',
    props: {
      background: colors.bg,
      columns,
      gap: 24,
      paddingY: 60,
    },
    children: [headerContainer, ...cards],
  }
}

// ─── Testimonials ─────────────────────────────────────────────

function buildTestimonialsSection(section: ParsedSection, sectionIndex: number, palette: ColorPalette | null): TemplateNode {
  const count = section.repeatedItems?.count ?? 3
  const columns = Math.min(count, 3)
  const colors = resolveColors(section, palette, sectionIndex)

  const cards: TemplateNode[] = Array.from({ length: Math.min(count, 6) }, (_, i) => ({
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: `Depoimento ${i + 1}`,
    props: {
      background: colors.cardBg,
      padding: 24,
      gap: 12,
      width: '100%',
      height: 'auto',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      shadow: colors.shadow,
      radius: 12,
    },
    children: [
      {
        type: 'TextComponent',
        displayName: 'Citação',
        props: {
          text: '"Depoimento do cliente. Edite com informações reais."',
          fontSize: '14',
          fontWeight: '400',
          textAlign: 'left',
          color: colors.text,
          margin: [0, 0, 8, 0],
        },
      },
      {
        type: 'TextComponent',
        displayName: 'Autor',
        props: {
          text: `— Nome do Cliente ${i + 1}`,
          fontSize: '13',
          fontWeight: '600',
          textAlign: 'left',
          color: colors.subtext,
          margin: [0, 0, 0, 0],
        },
      },
    ],
  }))

  return {
    type: 'TestimonialsSectionComponent',
    isCanvas: true,
    displayName: 'Depoimentos',
    props: { background: colors.bg, columns, paddingY: 60 },
    children: [
      {
        type: 'HeadingComponent',
        displayName: 'Titulo',
        props: {
          text: heading(section, 'Depoimentos'),
          tagName: 'h2',
          fontSize: '32',
          fontWeight: '700',
          textAlign: 'center',
          color: colors.heading,
        },
      },
      ...cards,
    ],
  }
}

// ─── About / Quem Somos ───────────────────────────────────────

function buildAboutSection(section: ParsedSection, sectionIndex: number, palette: ColorPalette | null): TemplateNode {
  const isTwoCol = section.layout.type === 'two-column' || section.contentInventory.statNumbers >= 2
  const colors = resolveColors(section, palette, sectionIndex)

  const leftColumn: TemplateNode = {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Conteudo',
    props: {
      background: 'transparent',
      padding: 0,
      gap: 12,
      width: '100%',
      height: 'auto',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'center',
      shadow: 0,
      radius: 0,
    },
    children: [
      {
        type: 'HeadingComponent',
        displayName: 'Titulo',
        props: {
          text: heading(section, 'Quem Somos'),
          tagName: 'h2',
          fontSize: '32',
          fontWeight: '700',
          textAlign: 'left',
          color: colors.heading,
        },
      },
      {
        type: 'TextComponent',
        displayName: 'Descrição',
        props: {
          text: paragraphText(section, 'Descrição sobre a empresa. Edite com suas informações.'),
          fontSize: '16',
          fontWeight: '400',
          textAlign: 'left',
          color: colors.text,
          margin: [8, 0, 0, 0],
        },
      },
      {
        type: 'ButtonComponent',
        displayName: 'Botao',
        props: {
          text: ctaText(section, 'Saiba Mais'),
          href: '#',
          background: colors.accentColor,
          color: '#ffffff',
          size: 'md',
          buttonStyle: 'filled',
          borderRadius: 8,
        },
      },
    ],
  }

  const children: TemplateNode[] = [leftColumn]

  if (isTwoCol && section.contentInventory.statNumbers > 0) {
    const statCount = Math.min(section.contentInventory.statNumbers, 4)
    const statLabels = ['Anos de Atuação', 'Clientes Atendidos', 'Projetos Entregues', 'Especialistas']

    const statBlocks: TemplateNode[] = Array.from({ length: statCount }, (_, i) => ({
      type: 'ContainerComponent',
      isCanvas: true,
      displayName: `Metrica ${i + 1}`,
      props: {
        background: 'transparent',
        padding: 16,
        gap: 4,
        width: '100%',
        height: 'auto',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        shadow: 0,
        radius: 8,
      },
      children: [
        {
          type: 'HeadingComponent',
          displayName: 'Número',
          props: {
            text: '00+',
            tagName: 'h3',
            fontSize: '36',
            fontWeight: '800',
            textAlign: 'center',
            color: colors.accentColor,
          },
        },
        {
          type: 'TextComponent',
          displayName: 'Label',
          props: {
            text: statLabels[i] || `Métrica ${i + 1}`,
            fontSize: '14',
            fontWeight: '500',
            textAlign: 'center',
            color: colors.subtext,
            margin: [0, 0, 0, 0],
          },
        },
      ],
    }))

    const rightColumn: TemplateNode = {
      type: 'FeaturesSectionComponent',
      isCanvas: true,
      displayName: 'Metricas',
      props: { background: 'transparent', columns: 2, gap: 16, paddingY: 0 },
      children: statBlocks,
    }

    children.push(rightColumn)
  }

  return {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Sobre',
    props: {
      background: colors.bg,
      padding: 60,
      gap: 40,
      width: '100%',
      height: 'auto',
      flexDirection: isTwoCol ? 'row' : 'column',
      alignItems: 'center',
      justifyContent: 'center',
      shadow: 0,
      radius: 0,
    },
    children,
  }
}

// ─── FAQ ──────────────────────────────────────────────────────

function buildFaqSection(section: ParsedSection, sectionIndex: number, palette: ColorPalette | null): TemplateNode {
  const count = section.repeatedItems?.count ?? 5
  const colors = resolveColors(section, palette, sectionIndex)
  const cardBg = isDarkColor(colors.bg) ? lightenHex(colors.bg, 15) : '#f8fafc'

  const qaItems: TemplateNode[] = Array.from({ length: Math.min(count, 10) }, (_, i) => ({
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: `Pergunta ${i + 1}`,
    props: {
      background: cardBg,
      padding: 20,
      gap: 8,
      width: '100%',
      height: 'auto',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      shadow: 0,
      radius: 8,
    },
    children: [
      {
        type: 'HeadingComponent',
        displayName: 'Pergunta',
        props: {
          text: section.headingTexts[i + 1] ?? `Pergunta frequente ${i + 1}?`,
          tagName: 'h3',
          fontSize: '16',
          fontWeight: '600',
          textAlign: 'left',
          color: colors.heading,
        },
      },
      {
        type: 'TextComponent',
        displayName: 'Resposta',
        props: {
          text: 'Resposta da pergunta. Edite com suas informações.',
          fontSize: '14',
          fontWeight: '400',
          textAlign: 'left',
          color: colors.text,
          margin: [0, 0, 0, 0],
        },
      },
    ],
  }))

  return {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Perguntas Frequentes',
    props: {
      background: colors.bg,
      padding: 60,
      gap: 16,
      width: '100%',
      height: 'auto',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      shadow: 0,
      radius: 0,
    },
    children: [
      {
        type: 'HeadingComponent',
        displayName: 'Titulo',
        props: {
          text: heading(section, 'Perguntas Frequentes'),
          tagName: 'h2',
          fontSize: '32',
          fontWeight: '700',
          textAlign: 'center',
          color: colors.heading,
        },
      },
      ...qaItems,
    ],
  }
}

// ─── Logos / Partners ─────────────────────────────────────────

function buildLogosSection(section: ParsedSection, sectionIndex: number, palette: ColorPalette | null): TemplateNode {
  const count = section.repeatedItems?.count ?? section.contentInventory.imageCount ?? 6
  const columns = Math.min(count, 6)
  const colors = resolveColors(section, palette, sectionIndex)

  const logos: TemplateNode[] = Array.from({ length: Math.min(count, 8) }, (_, i) => ({
    type: 'ImageComponent',
    displayName: `Logo ${i + 1}`,
    props: {
      src: '',
      alt: `Parceiro ${i + 1}`,
      width: '120',
      height: '60',
      objectFit: 'contain',
      borderRadius: 0,
    },
  }))

  return {
    type: 'FeaturesSectionComponent',
    isCanvas: true,
    displayName: 'Parceiros',
    props: { background: colors.bg, columns, gap: 32, paddingY: 40 },
    children: [
      {
        type: 'HeadingComponent',
        displayName: 'Titulo',
        props: {
          text: heading(section, 'Nossos Parceiros'),
          tagName: 'h2',
          fontSize: '24',
          fontWeight: '600',
          textAlign: 'center',
          color: colors.heading,
        },
      },
      ...logos,
    ],
  }
}

// ─── Gallery ──────────────────────────────────────────────────

function buildGallerySection(section: ParsedSection, sectionIndex: number, palette: ColorPalette | null): TemplateNode {
  const count = section.repeatedItems?.count ?? 3
  const columns = section.layout.columns > 1 ? section.layout.columns : Math.min(count, 3)
  const colors = resolveColors(section, palette, sectionIndex)
  const hasHeading = section.repeatedItems?.itemStructure.hasHeading ?? true
  const hasText = section.repeatedItems?.itemStructure.hasText ?? true

  const cards: TemplateNode[] = Array.from({ length: Math.min(count, 6) }, (_, i) => {
    const cardChildren: TemplateNode[] = [
      {
        type: 'ImageComponent',
        displayName: 'Imagem',
        props: {
          src: '',
          alt: `Item ${i + 1}`,
          width: '100%',
          height: '200px',
          objectFit: 'cover',
          borderRadius: 0,
        },
      },
    ]

    if (hasHeading) {
      cardChildren.push({
        type: 'HeadingComponent',
        displayName: 'Titulo',
        props: {
          text: section.headingTexts[i + 1] ?? `Item ${i + 1}`,
          tagName: 'h3',
          fontSize: '18',
          fontWeight: '600',
          textAlign: 'left',
          color: colors.heading,
        },
      })
    }

    if (hasText) {
      cardChildren.push({
        type: 'TextComponent',
        displayName: 'Descrição',
        props: {
          text: 'Descrição do item. Edite com suas informações.',
          fontSize: '14',
          fontWeight: '400',
          textAlign: 'left',
          color: colors.subtext,
          margin: [0, 12, 12, 12],
        },
      })
    }

    return {
      type: 'ContainerComponent',
      isCanvas: true,
      displayName: `Card ${i + 1}`,
      props: {
        background: colors.cardBg,
        padding: 0,
        gap: 12,
        width: '100%',
        height: 'auto',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        shadow: colors.shadow,
        radius: 12,
      },
      children: cardChildren,
    }
  })

  return {
    type: 'FeaturesSectionComponent',
    isCanvas: true,
    displayName: 'Galeria',
    props: { background: colors.bg, columns, gap: 24, paddingY: 60 },
    children: [
      {
        type: 'HeadingComponent',
        displayName: 'Titulo',
        props: {
          text: heading(section, 'Galeria'),
          tagName: 'h2',
          fontSize: '32',
          fontWeight: '700',
          textAlign: 'center',
          color: colors.heading,
        },
      },
      ...cards,
    ],
  }
}

// ─── Contact ──────────────────────────────────────────────────

function buildContactSection(section: ParsedSection, sectionIndex: number, palette: ColorPalette | null): TemplateNode {
  const colors = resolveColors(section, palette, sectionIndex)

  return {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Contato',
    props: {
      background: colors.bg,
      padding: 60,
      gap: 16,
      width: '100%',
      height: 'auto',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      shadow: 0,
      radius: 0,
    },
    children: [
      {
        type: 'HeadingComponent',
        displayName: 'Titulo',
        props: {
          text: heading(section, 'Entre em Contato'),
          tagName: 'h2',
          fontSize: '32',
          fontWeight: '700',
          textAlign: 'center',
          color: colors.heading,
        },
      },
      {
        type: 'TextComponent',
        displayName: 'Descrição',
        props: {
          text: paragraphText(section, 'Entre em contato pelos canais abaixo.'),
          fontSize: '16',
          fontWeight: '400',
          textAlign: 'center',
          color: colors.text,
          margin: [0, 0, 8, 0],
        },
      },
      {
        type: 'TextComponent',
        displayName: 'Info Contato',
        props: {
          text: 'email@empresa.com  |  (00) 0000-0000',
          fontSize: '14',
          fontWeight: '400',
          textAlign: 'center',
          color: colors.subtext,
          margin: [0, 0, 16, 0],
        },
      },
      {
        type: 'ButtonComponent',
        displayName: 'Botao Contato',
        props: {
          text: ctaText(section, 'Enviar Mensagem'),
          href: '#',
          background: colors.accentColor,
          color: '#ffffff',
          size: 'lg',
          buttonStyle: 'filled',
          borderRadius: 8,
        },
      },
    ],
  }
}

// ─── CTA ──────────────────────────────────────────────────────

function buildCtaSection(section: ParsedSection, palette: ColorPalette | null): TemplateNode {
  // CTA sempre usa cor de destaque: accent real ou fallback azul
  const bg = palette?.accent ?? (section.actualBgColor ?? '#2563eb')
  const isDark = isDarkColor(bg)
  const headColor = isDark || isColorful(bg) ? '#ffffff' : '#111827'
  const textColor = '#e2e8f0'

  return {
    type: 'CtaSectionComponent',
    isCanvas: true,
    displayName: 'CTA',
    props: { background: bg, paddingY: 60, radius: 0 },
    children: [
      {
        type: 'HeadingComponent',
        displayName: 'Titulo CTA',
        props: {
          text: heading(section, 'Entre em Contato'),
          tagName: 'h2',
          fontSize: '36',
          fontWeight: '700',
          textAlign: 'center',
          color: headColor,
        },
      },
      {
        type: 'TextComponent',
        displayName: 'Subtitulo',
        props: {
          text: paragraphText(section, 'Fale conosco para saber mais sobre nossos serviços.'),
          fontSize: '18',
          fontWeight: '400',
          textAlign: 'center',
          color: textColor,
          margin: [0, 0, 8, 0],
        },
      },
      {
        type: 'TextComponent',
        displayName: 'Contato',
        props: {
          text: 'contato@empresa.com  |  (00) 0000-0000',
          fontSize: '14',
          fontWeight: '400',
          textAlign: 'center',
          color: '#cbd5e1',
          margin: [0, 0, 16, 0],
        },
      },
      {
        type: 'ButtonComponent',
        displayName: 'Botao CTA',
        props: {
          text: ctaText(section, 'Fale Conosco'),
          href: '#',
          background: '#ffffff',
          color: bg,
          size: 'lg',
          buttonStyle: 'filled',
          borderRadius: 8,
        },
      },
    ],
  }
}

// ─── Footer ───────────────────────────────────────────────────

function buildFooterSection(section: ParsedSection, palette: ColorPalette | null): TemplateNode {
  const cols = section.layout.columns > 1 ? Math.min(section.layout.columns, 4) : 3
  // Background sólido escuro como fallback
  const bg = palette?.primary
    ? (isDarkColor(palette.primary) ? palette.primary : '#0f172a')
    : '#0f172a'

  // Gradiente espelhado do hero (mesmos valores do palette)
  const hasGradient = !!(palette?.gradientFrom && palette?.gradientTo)
  const gradientFrom = hasGradient ? (palette!.gradientFrom as string) : ''
  const gradientTo = hasGradient ? (palette!.gradientTo as string) : ''
  const gradientType = palette?.gradientType ?? 'linear'
  const gradientDirection = palette?.gradientDirection ?? '135deg'

  return {
    type: 'FooterComponent',
    isCanvas: true,
    displayName: 'Rodape',
    props: { background: bg, gradientFrom, gradientTo, gradientType, gradientDirection, paddingY: 40, columns: cols },
    children: [
      {
        type: 'TextComponent',
        displayName: 'Empresa',
        props: {
          text: 'Nome da Empresa\n\u00a9 2026. Todos os direitos reservados.',
          fontSize: '13',
          fontWeight: '400',
          textAlign: 'left',
          color: '#9ca3af',
          margin: [0, 0, 0, 0],
        },
      },
      {
        type: 'TextComponent',
        displayName: 'Contato',
        props: {
          text: 'contato@empresa.com\n(00) 0000-0000',
          fontSize: '13',
          fontWeight: '400',
          textAlign: 'center',
          color: '#9ca3af',
          margin: [0, 0, 0, 0],
        },
      },
      {
        type: 'TextComponent',
        displayName: 'Endereco',
        props: {
          text: 'Endereço da empresa\nCidade/Estado',
          fontSize: '13',
          fontWeight: '400',
          textAlign: 'right',
          color: '#9ca3af',
          margin: [0, 0, 0, 0],
        },
      },
    ],
  }
}

// ─── Generic (smart fallback) ────────────────────────────────

function buildGenericSection(section: ParsedSection, sectionIndex: number, palette: ColorPalette | null): TemplateNode {
  const colors = resolveColors(section, palette, sectionIndex)
  const alignment = section.layout.contentAlignment

  const children: TemplateNode[] = [
    {
      type: 'HeadingComponent',
      displayName: 'Titulo',
      props: {
        text: heading(section, 'Título da Seção'),
        tagName: 'h2',
        fontSize: '32',
        fontWeight: '700',
        textAlign: alignment,
        color: colors.heading,
      },
    },
    {
      type: 'TextComponent',
      displayName: 'Texto',
      props: {
        text: paragraphText(section, 'Conteúdo da seção. Edite com suas informações.'),
        fontSize: '16',
        fontWeight: '400',
        textAlign: alignment,
        color: colors.text,
        margin: [8, 0, 0, 0],
      },
    },
  ]

  if (section.repeatedItems && section.repeatedItems.count >= 2) {
    const count = Math.min(section.repeatedItems.count, 6)
    const cols = section.layout.columns > 1 ? section.layout.columns : Math.min(count, 3)

    const cards: TemplateNode[] = Array.from({ length: count }, (_, i) => ({
      type: 'ContainerComponent',
      isCanvas: true,
      displayName: `Item ${i + 1}`,
      props: {
        background: colors.cardBg,
        padding: 20,
        gap: 8,
        width: '100%',
        height: 'auto',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        shadow: colors.shadow,
        radius: 8,
      },
      children: [
        {
          type: 'HeadingComponent',
          displayName: 'Titulo',
          props: {
            text: section.headingTexts[i + 1] ?? `Item ${i + 1}`,
            tagName: 'h3',
            fontSize: '16',
            fontWeight: '600',
            textAlign: 'left',
            color: colors.heading,
          },
        },
        {
          type: 'TextComponent',
          displayName: 'Texto',
          props: {
            text: 'Descrição do item.',
            fontSize: '14',
            fontWeight: '400',
            textAlign: 'left',
            color: colors.subtext,
            margin: [0, 0, 0, 0],
          },
        },
      ],
    }))

    return {
      type: 'FeaturesSectionComponent',
      isCanvas: true,
      displayName: 'Secao',
      props: { background: colors.bg, columns: cols, gap: 24, paddingY: 60 },
      children: [children[0], ...cards],
    }
  }

  if (section.contentInventory.buttonCount > 0) {
    children.push({
      type: 'ButtonComponent',
      displayName: 'Botao',
      props: {
        text: ctaText(section, 'Saiba Mais'),
        href: '#',
        background: colors.accentColor,
        color: '#ffffff',
        size: 'md',
        buttonStyle: 'filled',
        borderRadius: 8,
      },
    })
  }

  return {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Secao',
    props: {
      background: colors.bg,
      padding: 60,
      gap: 12,
      width: '100%',
      height: 'auto',
      flexDirection: 'column',
      alignItems: alignment === 'center' ? 'center' : 'flex-start',
      justifyContent: 'center',
      shadow: 0,
      radius: 0,
    },
    children,
  }
}

// ─── Main converter ───────────────────────────────────────────

type SectionBuilder = (section: ParsedSection, index: number, palette: ColorPalette | null) => TemplateNode

const sectionBuilders: Record<SectionType, SectionBuilder> = {
  navbar: (s, _i, p) => buildNavbarSection(s, p),
  hero: (s, _i, p) => buildHeroSection(s, p),
  features: buildFeaturesSection,
  testimonials: buildTestimonialsSection,
  about: buildAboutSection,
  faq: buildFaqSection,
  logos: buildLogosSection,
  gallery: buildGallerySection,
  cta: (s, _i, p) => buildCtaSection(s, p),
  contact: buildContactSection,
  footer: (s, _i, p) => buildFooterSection(s, p),
  generic: buildGenericSection,
}

const EMPTY_SECTION = (type: ParsedSection['sectionType']): ParsedSection => ({
  sectionType: type,
  childCount: 0,
  hasHeading: false,
  headingText: null,
  paragraphText: null,
  headingTexts: [],
  ctaTexts: [],
  layout: { type: 'stack', columns: 1, contentAlignment: 'center' },
  backgroundTone: 'dark',
  actualBgColor: null,
  contentInventory: {
    headingCount: 0, headingLevels: [], paragraphCount: 0,
    imageCount: 0, buttonCount: 1, listCount: 0, formCount: 0, hasIcon: false, statNumbers: 0,
  },
  repeatedItems: null,
  displayNameHint: null,
  hasVideo: false,
  videoType: null,
})

export function converterParaTemplate(response: FetchHtmlResponse): ImportResult {
  const palette = response.colorPalette ?? null
  const fontFamily = response.fontFamily ?? undefined

  // Cor de fundo da raiz da página — usa o background real do site quando disponível
  const paletteIsDark = palette?.primary ? isDarkColor(palette.primary) : false
  const rootBg = palette?.background
    ?? (paletteIsDark ? (palette?.primary ?? '#ffffff') : '#ffffff')

  const sectionNodes = response.sections.map((section, index) => {
    // Navbar e Footer têm componentes especializados — manter builders existentes
    const isSpecialized = section.sectionType === 'navbar' || section.sectionType === 'footer'

    // Se temos a árvore DOM e não é componente especializado → clonar estrutura real
    if (section.domTree && !isSpecialized) {
      return buildSectionFromDomTree(section, index, palette)
    }

    // Fallback: builder semântico (sempre com placeholders — heading/ctaText já retornam fallback)
    const builder = sectionBuilders[section.sectionType]
    return builder(section, index, palette)
  })

  // Injetar navbar no topo se não detectada
  const hasNavbar = response.sections.some((s) => s.sectionType === 'navbar')
  if (!hasNavbar) {
    sectionNodes.unshift(buildNavbarSection(EMPTY_SECTION('navbar'), palette))
  }

  // Injetar footer no fim se não detectado
  const hasFooter = response.sections.some((s) => s.sectionType === 'footer')
  if (!hasFooter) {
    sectionNodes.push(buildFooterSection(EMPTY_SECTION('footer'), palette))
  }

  // Garante ao menos um hero se nenhuma seção de conteúdo detectada (só navbar+footer injetados)
  if (sectionNodes.length <= 2) {
    const heroEmpty = EMPTY_SECTION('hero')
    heroEmpty.contentInventory.buttonCount = 1
    sectionNodes.splice(1, 0, buildHeroSection(heroEmpty, palette))
  }

  const root: TemplateNode = {
    type: 'ContainerComponent',
    isCanvas: true,
    displayName: 'Página',
    props: {
      background: rootBg,
      padding: 0,
      gap: 0,
      width: '100%',
      height: 'auto',
      flexDirection: 'column',
      alignItems: 'stretch',
      justifyContent: 'flex-start',
      shadow: 0,
      radius: 0,
      ...(fontFamily ? { fontFamily } : {}),
    },
    custom: { displayName: 'Página' },
    children: sectionNodes,
  }

  return {
    craftJson: buildCraftJson(root),
    nomeSugerido: response.title ?? 'Layout Importado',
    totalSecoes: response.sections.length,
  }
}
