/**
 * Utilitário de exportação: converte JSON serializado do Craft.js em HTML + CSS estático.
 *
 * Percorre a árvore de nós e gera HTML semântico com estilos inline,
 * produzindo uma página responsiva pronta para deploy.
 *
 * IMPORTANTE: cada render function deve espelhar fielmente o componente React
 * correspondente em src/features/editor/components/user-components/.
 */

import { ANIMATION_CSS, ANIMATION_JS } from './animation-styles'

// ─── Tipos internos ─────────────────────────────────────────────

interface CraftNodeData {
  type: { resolvedName: string }
  isCanvas: boolean
  props: Record<string, unknown>
  displayName: string
  hidden: boolean
  nodes: string[]
  linkedNodes: Record<string, string>
  parent?: string
}

type CraftTree = Record<string, CraftNodeData>

interface ExportOptions {
  /** Incluir Tailwind CDN reset (default: false — usa CSS reset próprio) */
  includeTailwindCdn?: boolean
  /** Título da página */
  pageTitle?: string
  /** Gerar CSS separado em vez de inline (default: false) */
  externalCss?: boolean
}

interface ExportResult {
  html: string
  css: string | null
}

// ─── Estilos CSS reset base ──────────────────────────────────────

const CSS_RESET = `*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{-webkit-text-size-adjust:100%;line-height:1.5;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;scroll-behavior:smooth}
body{min-height:100vh}
img,picture,video,canvas,svg{display:block;max-width:100%}
input,button,textarea,select{font:inherit}
p,h1,h2,h3,h4,h5,h6{overflow-wrap:break-word}
a{color:inherit;text-decoration:none}
hr{border:none}
`

// ─── Helpers ─────────────────────────────────────────────────────

function styleObj(styles: Record<string, string | number | undefined>): string {
  return Object.entries(styles)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => {
      const kebab = k.replace(/([A-Z])/g, '-$1').toLowerCase()
      return `${kebab}:${typeof v === 'number' && !kebab.includes('opacity') && !kebab.includes('flex') && !kebab.includes('z-index') ? `${v}px` : v}`
    })
    .join(';')
}

function tag(
  el: string,
  style: string,
  content: string,
  attrs: Record<string, string> = {},
): string {
  const attrStr = Object.entries(attrs)
    .map(([k, v]) => ` ${k}="${escapeHtml(v)}"`)
    .join('')
  const styleAttr = style ? ` style="${style}"` : ''

  const selfClosing = ['img', 'hr', 'br', 'input'].includes(el)
  if (selfClosing) {
    return `<${el}${attrStr}${styleAttr} />`
  }
  return `<${el}${attrStr}${styleAttr}>${content}</${el}>`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ─── Renderizadores por tipo de componente ───────────────────────

function renderNode(nodeId: string, tree: CraftTree): string {
  const node = tree[nodeId]
  if (!node || node.hidden) return ''

  const { resolvedName } = node.type
  const props = node.props
  const childrenHtml = node.nodes.map((id) => renderNode(id, tree)).join('\n')

  switch (resolvedName) {
    case 'ContainerComponent':
      return renderContainer(props, childrenHtml)
    case 'HeadingComponent':
      return renderHeading(props)
    case 'TextComponent':
      return renderText(props)
    case 'ButtonComponent':
      return renderButton(props)
    case 'ImageComponent':
      return renderImage(props)
    case 'DividerComponent':
      return renderDivider(props)
    case 'HeroSectionComponent':
      return renderHeroSection(props, childrenHtml)
    case 'FeaturesSectionComponent':
      return renderFeaturesSection(props, childrenHtml)
    case 'TestimonialsSectionComponent':
      return renderTestimonialsSection(props, childrenHtml)
    case 'CtaSectionComponent':
      return renderCtaSection(props, childrenHtml)
    case 'FooterComponent':
      return renderFooter(props, childrenHtml)
    case 'NavbarComponent':
      return renderNavbar(props)
    case 'VideoComponent':
      return renderVideo(props)
    case 'StatsBandComponent':
      return renderStatsBand(props)
    case 'TestimonialsGridComponent':
      return renderTestimonialsGrid(props)
    case 'SocialLinksComponent':
      return renderSocialLinks(props)
    case 'BentoFeaturesComponent':
      return renderBentoFeatures(props)
    case 'QuoteHighlightComponent':
      return renderQuoteHighlight(props)
    case 'SegmentsComponent':
      return renderSegments(props)
    case 'BadgeComponent':
      return renderBadge(props)
    case 'SpacerComponent':
      return renderSpacer(props)
    case 'ColumnsComponent':
      return renderColumns(props, childrenHtml, node, tree)
    case 'IconComponent':
      return renderIcon(props)
    case 'IconListComponent':
      return renderIconList(props)
    case 'StarRatingComponent':
      return renderStarRating(props)
    case 'NumberCounterComponent':
      return renderNumberCounter(props)
    case 'ProgressBarComponent':
      return renderProgressBar(props)
    case 'AlertComponent':
      return renderAlert(props)
    case 'ImageGalleryComponent':
      return renderImageGallery(props)
    case 'ImageCarouselComponent':
      return renderImageCarousel(props)
    case 'LogoGridComponent':
      return renderLogoGrid(props)
    case 'BeforeAfterComponent':
      return renderBeforeAfter(props)
    case 'TabsComponent':
      return renderTabs(props)
    case 'AccordionComponent':
      return renderAccordion(props)
    default:
      return childrenHtml ? `<div>${childrenHtml}</div>` : ''
  }
}

// ── Container ──
// Espelha: ContainerComponent.tsx

function renderContainer(props: Record<string, unknown>, children: string): string {
  const width = (props.width as string) || '100%'
  const height = (props.height as string) || 'auto'
  const isPixel = width.endsWith('px')
  const bgImage = props.backgroundImage as string | undefined
  const overlayColor = (props.overlayColor as string) || '#000000'
  const overlayOpacity = (props.overlayOpacity as number) || 0
  const borderAccent = props.borderAccent as string | undefined
  const borderAccentPos = (props.borderAccentPosition as string) || 'none'
  const shadowPreset = (props.boxShadowPreset as string) || 'none'
  const minHeight = props.minHeight as number | undefined
  const minWidth = props.minWidth as string | undefined
  const maxWidth = props.maxWidth as string | undefined
  const radius = props.radius as number
  const flexDirection = (props.flexDirection as string) || 'column'
  const flex = props.flex as string | undefined
  const flexWrap = props.flexWrap as string | undefined
  const marginTop = props.marginTop as number | undefined
  const marginBottom = props.marginBottom as number | undefined
  const hasImage = !!bgImage
  const hasOverlay = hasImage && overlayOpacity > 0

  // Resolve padding (paddingY/paddingX têm prioridade)
  const basePadding = (props.padding as number) ?? 20
  const paddingY = (props.paddingY as number) ?? basePadding
  const paddingX = (props.paddingX as number) ?? basePadding

  const shadowMap: Record<string, string> = {
    none: 'none',
    soft: '0 2px 15px rgba(0,0,0,0.06)',
    elevated: '0 8px 30px rgba(0,0,0,0.12)',
    dramatic: '0 20px 60px rgba(0,0,0,0.25)',
  }
  const boxShadowCustom = props.boxShadowCustom as string | undefined
  const resolvedShadow =
    boxShadowCustom
      ? boxShadowCustom
      : shadowPreset && shadowPreset !== 'none'
        ? shadowMap[shadowPreset]
        : (props.shadow as number) === 0
          ? 'none'
          : `0px 3px 100px ${props.shadow}px rgba(0,0,0,0.13)`

  const borderTopStyle = borderAccent && borderAccentPos === 'top' ? `4px solid ${borderAccent}` : undefined
  const borderLeftStyle = borderAccent && borderAccentPos === 'left' ? `4px solid ${borderAccent}` : undefined

  // Resolve flexWrap (default: wrap quando flexDirection='row')
  const resolvedFlexWrap = flexWrap ?? (flexDirection === 'row' ? 'wrap' : undefined)

  // Posicionamento absoluto (floating cards)
  const posTop = props.top as string | undefined
  const posRight = props.right as string | undefined
  const posBottom = props.bottom as string | undefined
  const posLeft = props.left as string | undefined
  const zIndex = props.zIndex as number | undefined
  const backdropFilter = props.backdropFilter as string | undefined
  const border = props.border as string | undefined
  const borderBottomProp = props.borderBottom as string | undefined
  const borderRadiusCustom = props.borderRadiusCustom as string | undefined
  const transform = props.transform as string | undefined

  // Animação
  const animPreset = (props.animationPreset as string) || 'none'
  const animMap: Record<string, string> = {
    float: 'lp-float 3s ease-in-out infinite',
    fadeInUp: 'lp-fadeInUp 0.6s ease both',
    fadeInRight: 'lp-fadeInRight 0.8s ease both',
  }

  const isAbsolute = (props.position as string) === 'absolute'
  const idAttr = props.sectionId ? ` id="${escapeHtml(String(props.sectionId))}"` : ''

  // Estilos base compartilhados (posição, tamanho, bordas, sombra, etc.)
  const baseStyleProps: Record<string, string | number | undefined> = {
    position: (props.position as string) || 'relative',
    width: isPixel ? '100%' : width,
    maxWidth: maxWidth || (isPixel ? width : undefined),
    minWidth: minWidth || undefined,
    margin: isPixel ? '0 auto' : undefined,
    marginTop: marginTop,
    marginBottom: marginBottom,
    height,
    borderRadius: borderRadiusCustom || (radius ? `${radius}px` : undefined),
    boxShadow: resolvedShadow,
    border: border || undefined,
    borderTop: borderTopStyle,
    borderLeft: borderLeftStyle,
    borderBottom: borderBottomProp || undefined,
    fontFamily: props.fontFamily as string | undefined,
    flex: flex || undefined,
    top: posTop || undefined,
    right: posRight || undefined,
    bottom: posBottom || undefined,
    left: posLeft || undefined,
    zIndex: zIndex || undefined,
    transform: transform || undefined,
    backdropFilter: backdropFilter || undefined,
    animation: animPreset !== 'none' ? animMap[animPreset] : undefined,
  }

  // Estilos de layout (flex, padding, gap)
  const layoutStyleProps: Record<string, string | number | undefined> = {
    display: 'flex',
    flexDirection,
    flexWrap: resolvedFlexWrap,
    alignItems: (props.alignItems as string) || 'flex-start',
    justifyContent: (props.justifyContent as string) || 'flex-start',
    padding: `${paddingY}px ${paddingX}px`,
    gap: `${props.gap ?? 10}px`,
    minHeight: isAbsolute ? `${minHeight ?? 0}px` : `${minHeight ?? 60}px`,
  }

  // Classe responsiva: containers com flex-direction row empilham em mobile/tablet
  const rowClass = flexDirection === 'row' ? ' class="lp-row"' : ''

  // ── SEM overlay: div único (espelha React ContainerComponent) ──
  if (!hasOverlay) {
    const singleStyle = styleObj({
      ...baseStyleProps,
      overflow: hasImage ? 'hidden' : undefined,
      backgroundImage: hasImage ? `url('${bgImage}')` : undefined,
      backgroundSize: hasImage ? 'cover' : undefined,
      backgroundPosition: hasImage ? 'center' : undefined,
      background: hasImage ? undefined : (props.background as string),
      ...layoutStyleProps,
    })
    return `<div${idAttr}${rowClass} style="${singleStyle}">${children}</div>`
  }

  // ── COM overlay: outer + overlay div + inner (espelha React ContainerComponent) ──
  const outerStyle = styleObj({
    ...baseStyleProps,
    overflow: 'hidden',
    backgroundImage: `url('${bgImage}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  })

  const overlayIsGradient = overlayColor.includes('gradient')
  const overlayHtml = `<div style="${styleObj({
    position: 'absolute',
    inset: '0',
    ...(overlayIsGradient
      ? { background: overlayColor }
      : { backgroundColor: overlayColor }),
    opacity: overlayOpacity,
    borderRadius: radius,
    pointerEvents: 'none',
    zIndex: 0,
  })}"></div>`

  const innerStyle = styleObj({
    ...layoutStyleProps,
    position: 'relative',
    zIndex: 1,
    width: '100%',
    height: '100%',
  })

  return `<div${idAttr} style="${outerStyle}">${overlayHtml}<div${rowClass} style="${innerStyle}">${children}</div></div>`
}

// ── Heading ──
// Espelha: HeadingComponent.tsx

function renderHeading(props: Record<string, unknown>): string {
  const el = (props.tagName as string) || 'h2'
  const text = (props.text as string) || ''
  // Resolve letterSpacing: se for numérico (ex: '-2'), acrescenta 'px'
  const rawLS = (props.letterSpacing as string) || 'normal'
  const letterSpacing = rawLS !== 'normal' && !rawLS.includes('px') && !rawLS.includes('em')
    ? `${rawLS}px`
    : rawLS
  // Resolve margin
  const margin = props.margin as number[] | undefined
  const marginStyle = margin ? `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px` : undefined
  const style = styleObj({
    fontSize: `${props.fontSize || 32}px`,
    textAlign: (props.textAlign as string) || 'left',
    fontWeight: (props.fontWeight as string) || '700',
    color: (props.color as string) || '#111827',
    lineHeight: (props.lineHeight as string) || '1.2',
    letterSpacing,
    textTransform: (props.textTransform as string) || 'none',
    maxWidth: (props.maxWidth as string) || undefined,
    margin: marginStyle,
    width: '100%',
  })
  return tag(el, style, escapeHtml(text))
}

// ── Text ──
// Espelha: TextComponent.tsx

function renderText(props: Record<string, unknown>): string {
  const text = (props.text as string) || ''
  const margin = (props.margin as number[]) || [0, 0, 0, 0]
  const maxWidth = props.maxWidth as string | undefined
  const textTransform = props.textTransform as string | undefined
  const letterSpacing = props.letterSpacing as string | undefined
  const style = styleObj({
    fontSize: `${props.fontSize || 16}px`,
    textAlign: (props.textAlign as string) || 'left',
    fontWeight: (props.fontWeight as string) || '400',
    color: (props.color as string) || '#333333',
    lineHeight: (props.lineHeight as string) || undefined,
    margin: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
    width: '100%',
    maxWidth: maxWidth || undefined,
    textTransform: textTransform || undefined,
    letterSpacing: letterSpacing ? `${letterSpacing}px` : undefined,
  })
  return tag('p', style, escapeHtml(text))
}

// ── Button ──
// Espelha: ButtonComponent.tsx

// ── Badge ──
// Espelha: BadgeComponent.tsx

function renderBadge(props: Record<string, unknown>): string {
  const text = (props.text as string) || 'Destaque'
  const badgeStyle = (props.badgeStyle as string) || 'soft'
  const color = (props.color as string) || '#2563eb'
  const backgroundColor = (props.backgroundColor as string) || '#eff6ff'
  const fontSize = (props.fontSize as number) || 12
  const borderRadius = (props.borderRadius as number) ?? 50
  const paddingX = (props.paddingX as number) ?? 14
  const paddingY = (props.paddingY as number) ?? 5
  const fontWeight = (props.fontWeight as number) || 600
  const textTransform = (props.textTransform as string) || 'uppercase'
  const letterSpacing = (props.letterSpacing as number) ?? 0.5
  const border = props.border as string | undefined
  const backdropFilter = props.backdropFilter as string | undefined
  const marginBottom = props.marginBottom as number | undefined

  let bgColor: string
  let textColor: string
  let borderStyle: string | undefined

  if (badgeStyle === 'filled') {
    bgColor = color
    textColor = '#ffffff'
    borderStyle = border || undefined
  } else if (badgeStyle === 'outlined') {
    bgColor = 'transparent'
    textColor = color
    borderStyle = border || `1.5px solid ${color}`
  } else {
    // soft
    bgColor = backgroundColor
    textColor = color
    borderStyle = border || undefined
  }

  const style = styleObj({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: `${fontSize}px`,
    fontWeight,
    borderRadius: `${borderRadius}px`,
    padding: `${paddingY}px ${paddingX}px`,
    textTransform,
    letterSpacing: `${letterSpacing}px`,
    lineHeight: '1.3',
    whiteSpace: 'nowrap',
    backgroundColor: bgColor,
    color: textColor,
    border: borderStyle,
    marginBottom: marginBottom,
    backdropFilter: backdropFilter || undefined,
  })

  return `<span style="${style}">${escapeHtml(text)}</span>`
}

// SVGs de ícones para botões (espelha Phosphor Icons usados no React)
const BUTTON_ICON_SVG: Record<string, string> = {
  whatsapp: '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>',
  phone: '<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>',
  email: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
  arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
}

function renderButton(props: Record<string, unknown>): string {
  const text = (props.text as string) || 'Clique Aqui'
  const href = (props.href as string) || '#'
  const btnStyle = (props.buttonStyle as string) || 'filled'
  const size = (props.size as string) || 'md'
  const bg = (props.background as string) || '#2563eb'
  const color = (props.color as string) || '#ffffff'
  const radius = (props.borderRadius as number) ?? 8
  const icon = (props.icon as string) || ''
  const iconPosition = (props.iconPosition as string) || 'left'

  const sizeConfig: Record<string, { padding: string; fontSize: string; iconSize: number; gap: number }> = {
    sm: { padding: '6px 16px', fontSize: '14px', iconSize: 16, gap: 6 },
    md: { padding: '10px 24px', fontSize: '16px', iconSize: 18, gap: 8 },
    lg: { padding: '14px 32px', fontSize: '18px', iconSize: 22, gap: 10 },
  }
  const config = sizeConfig[size] || sizeConfig.md

  // Padding customizado sobrescreve o tamanho padrão
  const paddingX = props.paddingX as number | undefined
  const paddingY = props.paddingY as number | undefined
  const resolvedPadding = (paddingX || paddingY)
    ? `${paddingY ?? parseInt(config.padding)}px ${paddingX ?? parseInt(config.padding.split(' ')[1] || config.padding)}px`
    : config.padding

  let baseStyle = `display:inline-flex;align-items:center;justify-content:center;gap:${config.gap}px;font-weight:600;text-decoration:none;cursor:pointer;border-radius:${radius}px;text-align:center;padding:${resolvedPadding};font-size:${config.fontSize}`

  if (btnStyle === 'filled') {
    baseStyle += `;background:${bg};color:${color};border:none`
  } else if (btnStyle === 'outline') {
    baseStyle += `;background:transparent;color:${bg};border:2px solid ${bg}`
  } else {
    baseStyle += `;background:transparent;color:${bg};border:none`
  }

  const shadow = props.shadow as string | undefined
  if (shadow) baseStyle += `;box-shadow:${shadow}`

  // Ícone SVG
  let iconHtml = ''
  if (icon && BUTTON_ICON_SVG[icon]) {
    const svgPath = BUTTON_ICON_SVG[icon]
    const isFilled = icon === 'whatsapp'
    const svgAttrs = isFilled
      ? `fill="currentColor"`
      : `fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`
    iconHtml = `<svg width="${config.iconSize}" height="${config.iconSize}" viewBox="0 0 24 24" ${svgAttrs}>${svgPath}</svg>`
  }

  const leftIcon = icon && iconPosition === 'left' ? iconHtml : ''
  const rightIcon = icon && iconPosition === 'right' ? iconHtml : ''

  return `<a href="${escapeHtml(href)}" style="${baseStyle}">${leftIcon}${escapeHtml(text)}${rightIcon}</a>`
}

// ── Image ──
// Espelha: ImageComponent.tsx

function renderImage(props: Record<string, unknown>): string {
  const src = (props.src as string) || ''
  const width = (props.width as string | number) || '100%'
  const height = (props.height as string | number) || 'auto'
  const objectFit = (props.objectFit as string) || 'cover'
  const radius = props.borderRadius as number | string | undefined
  const bg = props.backgroundColor as string | undefined
  const filter = props.filter as string | undefined
  const hasBg = bg && bg !== 'transparent' && bg !== ''

  if (!src) {
    const ph = styleObj({
      width: typeof width === 'number' ? width : width,
      height: height === 'auto' ? '200px' : height,
      borderRadius: radius,
      background: '#e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    })
    return `<div style="${ph}">` +
      `<span style="color:#9ca3af;font-size:14px;font-family:system-ui,sans-serif">Imagem</span></div>`
  }

  const maxWidth = props.maxWidth as string | undefined
  const boxShadow = props.boxShadow as string | undefined
  const zIndex = props.zIndex as number | undefined

  const imgStyle = styleObj({
    width: hasBg ? '100%' : width,
    height: hasBg ? '100%' : height,
    objectFit,
    borderRadius: hasBg ? undefined : radius,
    display: 'block',
    filter: filter || undefined,
  })

  const imgTag = tag('img', imgStyle, '', {
    src,
    alt: (props.alt as string) || 'Imagem',
    loading: 'lazy',
  })

  if (hasBg) {
    const wrapStyle = styleObj({
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: bg,
      borderRadius: radius,
      width,
      maxWidth: maxWidth || undefined,
      height: height === 'auto' ? undefined : height,
      padding: '4px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      boxShadow: boxShadow || undefined,
      zIndex: zIndex || undefined,
    })
    return `<div style="${wrapStyle}">${imgTag}</div>`
  }

  // Sempre envolver em div com overflow hidden (espelha o React)
  const wrapStyle = styleObj({
    position: 'relative',
    width,
    maxWidth: maxWidth || undefined,
    height,
    borderRadius: radius,
    overflow: 'hidden',
    boxShadow: boxShadow || undefined,
    zIndex: zIndex || undefined,
  })
  return `<div style="${wrapStyle}">${imgTag}</div>`
}

// ── Navbar ──
// Espelha: NavbarComponent.tsx

function renderNavbar(props: Record<string, unknown>): string {
  const bg = (props.background as string) || '#0f172a'
  const logoText = (props.logoText as string) ?? ''
  const logoSrc = (props.logoSrc as string) ?? ''
  const links = (props.links as Array<{ label: string; href: string }>) || []
  const ctaText = (props.ctaText as string) || ''
  const ctaBg = (props.ctaBg as string) || '#f97316'
  const ctaColor = (props.ctaColor as string) || '#ffffff'
  const linkColor = (props.linkColor as string) || '#ffffff'
  const paddingX = (props.paddingX as number) ?? 40
  const paddingY = (props.paddingY as number) ?? 16
  const backdropBlur = (props.backdropBlur as number) ?? 0
  const borderBottom = (props.borderBottom as string) || 'none'
  const ctaBorderRadius = (props.ctaBorderRadius as number) ?? 8
  const linkFontSize = (props.linkFontSize as number) ?? 14
  const logoHeight = (props.logoHeight as number) ?? 44
  const logoBg = (props.logoBg as string) || 'transparent'
  const logoWidth = props.logoWidth as number | undefined
  const logoShape = (props.logoShape as string) || 'pill'
  const showLogoText = (props.showLogoText as boolean) ?? false

  const hasLogo = !!(logoSrc || logoText)
  const hasBlur = backdropBlur > 0

  let logoHtml = ''
  if (hasLogo) {
    if (logoSrc) {
      const hasBg = logoBg && logoBg !== 'transparent'
      const isCircle = logoShape === 'circle'
      const isDropdown = logoShape === 'dropdown'
      const containerSize = logoHeight + 8

      let wrapStyle: string
      if (isDropdown) {
        // Estilo "dropdown" — container que "pende" do navbar
        wrapStyle = `background-color:${escapeHtml(logoBg || '#ffffff')};border-radius:0 0 12px 12px;padding:12px 24px;margin-top:-${paddingY}px;box-shadow:0 4px 20px rgba(0,0,0,0.15);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;align-self:flex-start`
      } else if (isCircle && hasBg) {
        wrapStyle = `display:inline-flex;align-items:center;justify-content:center;background-color:${escapeHtml(logoBg)};border-radius:50%;width:${containerSize}px;height:${containerSize}px;overflow:hidden;flex-shrink:0`
      } else if (hasBg) {
        wrapStyle = `display:inline-flex;align-items:center;background-color:${escapeHtml(logoBg)};border-radius:8px;padding:6px 10px`
      } else {
        wrapStyle = `display:inline-flex;align-items:center`
      }

      const imgStyle = isDropdown
        ? `width:${logoWidth ? `${logoWidth}px` : '180px'};height:auto;max-width:100%;object-fit:contain;display:block`
        : isCircle
          ? `height:${logoHeight}px;width:${logoHeight}px;object-fit:cover;display:block${!hasBg ? ';border-radius:50%' : ''}`
          : `height:${logoHeight}px;${logoWidth ? `width:${logoWidth}px;` : 'width:auto;max-width:200px;'}object-fit:contain;display:block`

      logoHtml = `<div style="${wrapStyle}">` +
        `<img src="${escapeHtml(logoSrc)}" alt="${escapeHtml(logoText)}" style="${imgStyle}" /></div>`

      if (showLogoText && logoText) {
        logoHtml += `<span style="color:${escapeHtml(linkColor)};font-weight:700;font-size:clamp(14px,2.5vw,18px);letter-spacing:-0.01em;white-space:nowrap">${escapeHtml(logoText)}</span>`
      }
    } else {
      logoHtml = `<span style="color:${escapeHtml(linkColor)};font-weight:700;font-size:clamp(16px,3vw,20px);letter-spacing:-0.02em">${escapeHtml(logoText)}</span>`
    }
  }

  const linksHtml = links.map((l) =>
    `<a href="${escapeHtml(l.href)}" style="color:${escapeHtml(linkColor)};font-size:clamp(11px,2.5vw,${linkFontSize}px);font-weight:500;text-decoration:none;letter-spacing:0.3px;white-space:nowrap">${escapeHtml(l.label)}</a>`,
  ).join('\n')

  const ctaHtml = ctaText
    ? `<button style="background:${escapeHtml(ctaBg)};color:${escapeHtml(ctaColor)};border:none;border-radius:${ctaBorderRadius}px;padding:clamp(7px,1.8vw,11px) clamp(12px,3vw,24px);font-size:clamp(11px,2.5vw,${linkFontSize}px);font-weight:600;cursor:pointer;white-space:nowrap;flex-shrink:0;letter-spacing:0.2px">${escapeHtml(ctaText)}</button>`
    : ''

  const blurStyles = hasBlur
    ? `;backdrop-filter:blur(${backdropBlur}px);-webkit-backdrop-filter:blur(${backdropBlur}px)`
    : ''

  const contentMaxWidth = props.contentMaxWidth as string | undefined
  const flexStyles = `display:flex;align-items:center;justify-content:${hasLogo ? 'space-between' : 'center'};flex-wrap:wrap;gap:clamp(6px,1.5vw,${paddingY}px) clamp(10px,3vw,${hasLogo ? 16 : 40}px)`
  const navStyle = `width:100%;background:${escapeHtml(bg)};padding:clamp(10px,2vw,${paddingY}px) clamp(12px,4vw,${paddingX}px);box-sizing:border-box;border-bottom:${escapeHtml(borderBottom)}${blurStyles}${contentMaxWidth ? '' : `;${flexStyles}`}`
  const linksContainerStyle = `display:flex;align-items:center;flex-wrap:wrap;gap:clamp(8px,2.5vw,32px);justify-content:center${hasLogo ? ';flex:1 1 auto;min-width:0' : ''}`

  const innerContent = `${hasLogo ? `<div style="display:flex;align-items:center;flex-shrink:0;gap:10px">${logoHtml}</div>` : ''}
  <div class="lp-nav-links" style="${linksContainerStyle}">${linksHtml}</div>
  ${ctaHtml}`

  if (contentMaxWidth) {
    return `<nav style="${navStyle}"><div class="lp-nav-inner" style="${flexStyles};max-width:${escapeHtml(contentMaxWidth)};margin:0 auto;width:100%">${innerContent}</div></nav>`
  }
  return `<nav style="${navStyle}">${innerContent}</nav>`
}

// ── Video ──

function getVideoEmbedUrl(url: string): string | null {
  if (!url) return null
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  return null
}

function renderVideo(props: Record<string, unknown>): string {
  const url = (props.url as string) || ''
  const width = (props.width as string) || '100%'
  const height = (props.height as string) || '400px'
  const radius = (props.borderRadius as number) ?? 12
  const bg = (props.background as string) || '#0f172a'
  const embedUrl = getVideoEmbedUrl(url)

  const wrapperStyle = `width:${width};height:${height};border-radius:${radius}px;overflow:hidden;background:${escapeHtml(bg)};display:flex;align-items:center;justify-content:center;position:relative`

  if (embedUrl) {
    const originalUrl = url.startsWith('http') ? url : (embedUrl.replace('/embed/', '/watch?v=').replace('?rel=0', ''))
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
    const thumbUrl = ytMatch ? `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg` : ''

    return `<div style="${wrapperStyle}">` +
      `<iframe src="${escapeHtml(embedUrl)}" style="width:100%;height:100%;border:none;position:absolute;inset:0;z-index:1" ` +
      `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ` +
      `allowfullscreen title="Vídeo"></iframe>` +
      `<a href="${escapeHtml(originalUrl)}" target="_blank" rel="noopener noreferrer" style="position:absolute;inset:0;z-index:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-decoration:none;color:rgba(255,255,255,0.8)${thumbUrl ? `;background:url(${thumbUrl}) center/cover no-repeat` : ''}">` +
      `<div style="width:72px;height:72px;border-radius:50%;background:rgba(0,0,0,0.65);display:flex;align-items:center;justify-content:center">` +
      `<svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg></div>` +
      `<span style="margin-top:12px;font-size:13px;font-weight:500;background:rgba(0,0,0,0.5);padding:4px 12px;border-radius:4px">Assistir vídeo</span>` +
      `</a></div>`
  }

  return `<div style="${wrapperStyle}">
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:rgba(255,255,255,0.6)">
    <div style="width:64px;height:64px;border-radius:50%;border:2px solid rgba(255,255,255,0.4);display:flex;align-items:center;justify-content:center">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
    </div>
    <span style="font-size:13px;opacity:0.7;font-family:system-ui,sans-serif">Vídeo</span>
  </div>
</div>`
}

// ── Divider ──
// Espelha: DividerComponent.tsx

function renderDivider(props: Record<string, unknown>): string {
  const color = (props.color as string) || '#e5e7eb'
  const thickness = (props.thickness as number) || 1
  const marginY = (props.marginY as number) || 20
  const lineStyle = (props.style as string) || 'solid'
  const dividerWidth = (props.width as string) || '100%'
  const needsCentering = dividerWidth !== '100%'
  const borderRadius = `${thickness / 2}px`

  // Background: suporta dashed/dotted via repeating-linear-gradient (espelha React)
  let background: string
  if (lineStyle === 'dashed') {
    background = `repeating-linear-gradient(90deg, ${color} 0, ${color} 8px, transparent 8px, transparent 16px)`
  } else if (lineStyle === 'dotted') {
    background = `repeating-linear-gradient(90deg, ${color} 0, ${color} 4px, transparent 4px, transparent 8px)`
  } else {
    background = color
  }

  const wrapStyle = `width:100%;display:flex;justify-content:${needsCentering ? 'center' : 'flex-start'};margin:${marginY}px 0`
  const innerStyle = `width:${dividerWidth};height:${thickness}px;background:${background};border-radius:${borderRadius}`

  return `<div style="${wrapStyle}"><div style="${innerStyle}"></div></div>`
}

// ── Hero Section ──
// Espelha: HeroSectionComponent.tsx — estrutura de 2 divs (section > overlay? + content div)

function buildHeroBackground(props: Record<string, unknown>): string {
  const bgImage = props.backgroundImage as string | undefined
  if (bgImage) return 'transparent'

  const gradientFrom = props.gradientFrom as string
  const gradientTo = props.gradientTo as string
  if (!gradientFrom || !gradientTo) return (props.background as string) || '#0f172a'

  const gradientType = (props.gradientType as string) || 'linear'
  const gradientDir = (props.gradientDirection as string) || '135deg'

  if (gradientType === 'radial') {
    const dir = gradientDir || 'circle at bottom right'
    return `radial-gradient(${dir}, ${gradientFrom}, ${gradientTo})`
  }
  return `linear-gradient(${gradientDir}, ${gradientFrom} 0%, ${gradientTo} 100%)`
}

function renderHeroSection(props: Record<string, unknown>, children: string): string {
  const textAlign = (props.textAlign as string) || 'center'
  const alignMap: Record<string, string> = {
    center: 'center',
    right: 'flex-end',
    left: 'flex-start',
  }

  const bg = buildHeroBackground(props)
  const bgImage = props.backgroundImage as string | undefined
  const hasImage = !!bgImage
  const overlayOpacity = (props.overlayOpacity as number) ?? 0
  const overlayColor = (props.overlayColor as string) || '#000000'
  const hasOverlay = hasImage && overlayOpacity > 0

  const minHeightCalc = props.minHeightCalc as string | undefined
  const minHeightVh = props.minHeightVh as number | undefined
  const minHeightPx = (props.minHeight as number) || 200
  const resolvedMinHeight = minHeightCalc
    ? minHeightCalc
    : minHeightVh ? `${minHeightVh}vh` : `${minHeightPx}px`
  const parallax = props.parallax as boolean | undefined

  // Outer section — espelha o <section> do React
  const sectionStyle = styleObj({
    position: 'relative',
    width: '100%',
    background: bg,
    backgroundImage: hasImage ? `url('${bgImage}')` : undefined,
    backgroundSize: hasImage ? 'cover' : undefined,
    backgroundPosition: hasImage ? 'center' : undefined,
    backgroundAttachment: hasImage && parallax ? 'fixed' : undefined,
    ...(minHeightCalc || minHeightVh
      ? { height: resolvedMinHeight }
      : { minHeight: resolvedMinHeight }),
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  })

  // Overlay (suporta cor sólida ou gradiente)
  let overlayHtml = ''
  if (hasOverlay) {
    const isGradient = overlayColor.includes('gradient')
    overlayHtml = `<div style="${styleObj({
      position: 'absolute',
      inset: '0',
      ...(isGradient
        ? { background: overlayColor }
        : { backgroundColor: overlayColor }),
      opacity: overlayOpacity,
      pointerEvents: 'none',
      zIndex: 0,
    })}"></div>`
  }

  // Resolução de padding: específico > geral (espelha o React)
  const paddingY = (props.paddingY as number) ?? 60
  const paddingTop = (props.paddingTop as number) ?? paddingY
  const paddingBottom = (props.paddingBottom as number) ?? paddingY
  const contentMaxWidth = props.contentMaxWidth as string | undefined

  // Inner content div — flex:1 preenche a section (espelha .hero-content { height:100% })
  const innerStyle = styleObj({
    position: 'relative',
    zIndex: 1,
    width: '100%',
    flex: '1 1 auto',
    paddingTop: `${paddingTop}px`,
    paddingBottom: `${paddingBottom}px`,
    paddingLeft: 'clamp(16px, 5vw, 40px)',
    paddingRight: 'clamp(16px, 5vw, 40px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: alignMap[textAlign] || 'center',
    gap: '20px',
    textAlign,
    ...(contentMaxWidth ? { maxWidth: contentMaxWidth, margin: '0 auto' } : {}),
  })

  return `<section class="lp-animate lp-stagger lp-hero" style="${sectionStyle}">${overlayHtml}<div style="${innerStyle}">${children}</div></section>`
}

// ── Features Section ──
// Espelha: FeaturesSectionComponent.tsx — SEM wrapGridChildrenWithSpan

function renderFeaturesSection(props: Record<string, unknown>, children: string): string {
  const cols = (props.columns as number) || 3
  const gap = (props.gap as number) || 24
  const contentMaxWidth = (props.contentMaxWidth as string) || '1200px'

  const sectionStyle = styleObj({
    width: '100%',
    background: (props.background as string) || '#ffffff',
    padding: `${props.paddingY || 60}px clamp(16px, 5vw, 40px)`,
  })
  const innerStyle = styleObj({
    maxWidth: contentMaxWidth,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: `${gap}px`,
    minHeight: '150px',
  })
  const attrs: Record<string, string> = { class: 'lp-animate lp-stagger lp-features-grid' }
  if (props.sectionId) attrs.id = String(props.sectionId)
  return tag('section', sectionStyle, `<div class="lp-features-inner" style="${innerStyle}">${children}</div>`, attrs)
}

// ── Testimonials Section ──
// Espelha: TestimonialsSectionComponent.tsx — SEM wrapGridChildrenWithSpan, SEM cap 280

function renderTestimonialsSection(props: Record<string, unknown>, children: string): string {
  const cols = (props.columns as number) || 2
  const contentMaxWidth = (props.contentMaxWidth as string) || '1200px'
  const minColWidth = Math.max(250, Math.round(600 / cols))

  const sectionStyle = styleObj({
    width: '100%',
    background: (props.background as string) || '#f8fafc',
    padding: `${props.paddingY || 60}px clamp(16px, 5vw, 40px)`,
  })
  const innerStyle = styleObj({
    maxWidth: contentMaxWidth,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(${minColWidth}px, 1fr))`,
    gap: '24px',
    minHeight: '150px',
  })
  return tag('section', sectionStyle, `<div style="${innerStyle}">${children}</div>`, { class: 'lp-animate lp-stagger' })
}

// ── CTA Section ──
// Espelha: CtaSectionComponent.tsx

function renderCtaSection(props: Record<string, unknown>, children: string): string {
  const contentMaxWidth = (props.contentMaxWidth as string) || '1200px'

  const sectionStyle = styleObj({
    width: '100%',
    background: (props.background as string) || '#2563eb',
    padding: `${props.paddingY || 50}px clamp(16px, 5vw, 40px)`,
    borderRadius: props.radius as number,
  })
  const innerStyle = styleObj({
    maxWidth: contentMaxWidth,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    minHeight: '120px',
    textAlign: 'center',
  })
  const ctaAttrs: Record<string, string> = { class: 'lp-animate lp-stagger' }
  if (props.sectionId) ctaAttrs.id = String(props.sectionId)
  return tag('section', sectionStyle, `<div style="${innerStyle}">${children}</div>`, ctaAttrs)
}

// ── Footer ──
// Espelha: FooterComponent.tsx — com radial-gradient e min() no grid

function renderFooter(props: Record<string, unknown>, children: string): string {
  const cols = (props.columns as number) || 3

  const gradientFrom = props.gradientFrom as string
  const gradientTo = props.gradientTo as string
  const gradientType = (props.gradientType as string) || 'linear'
  const gradientDir = (props.gradientDirection as string) || '135deg'

  let bg: string
  if (gradientFrom && gradientTo) {
    if (gradientType === 'radial') {
      const dir = gradientDir || 'circle at bottom right'
      bg = `radial-gradient(${dir}, ${gradientFrom}, ${gradientTo})`
    } else {
      bg = `linear-gradient(${gradientDir}, ${gradientFrom}, ${gradientTo})`
    }
  } else {
    bg = (props.background as string) || '#111827'
  }

  const outerStyle = styleObj({
    width: '100%',
    background: bg,
    padding: `${props.paddingY || 40}px clamp(16px, 5vw, 40px)`,
    minHeight: '100px',
  })

  const maxW = (props.contentMaxWidth as string) || '1100px'
  const innerStyle = styleObj({
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: 'clamp(16px, 3vw, 30px)',
    maxWidth: maxW,
    margin: '0 auto',
    width: '100%',
  })

  return tag('footer', outerStyle, `<div class="lp-footer-grid" style="${innerStyle}">${children}</div>`)
}

// ── Stats Band ──
// Espelha: StatsBandComponent.tsx — borderRight (não div separado), clamp gaps

// ── Segments ──
// Espelha: SegmentsComponent.tsx

function renderSegments(props: Record<string, unknown>): string {
  const bg = (props.background as string) || '#f0faf8'
  const bgTo = (props.backgroundTo as string) || '#ffffff'
  const primaryLight = (props.primaryLight as string) || '#f0faf8'
  const primaryLighter = (props.primaryLighter as string) || '#e0f5f0'
  const primaryAlpha10 = (props.primaryAlpha10 as string) || 'rgba(14,111,92,0.1)'
  const titleColor = (props.titleColor as string) || '#0f172a'
  const textColor = (props.textColor as string) || '#64748b'
  const accentColor = (props.accentColor as string) || '#123f63'
  const paddingY = (props.paddingY as number) ?? 80
  const sectionTag = (props.sectionTag as string) || 'QUEM ATENDEMOS'
  const sectionTitle = (props.sectionTitle as string) || 'Segmentos de Atuação'
  const sectionDescription = (props.sectionDescription as string) || 'Experiência comprovada em diversos setores da economia.'
  const maxWidth = (props.contentMaxWidth as string) || '1000px'
  const sectionId = props.sectionId as string | undefined

  const segments = (props.segments as Array<{ icon: string; titulo: string; descricao: string }>) || []

  const headerHtml = `<div style="text-align:center;margin-bottom:56px">
    <span style="display:inline-block;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${escapeHtml(accentColor)};margin-bottom:12px">${escapeHtml(sectionTag)}</span>
    <h2 style="font-size:clamp(32px,5vw,48px);font-weight:800;color:${escapeHtml(titleColor)};line-height:1.2;letter-spacing:-0.5px;margin-bottom:16px">${escapeHtml(sectionTitle)}</h2>
    <div style="width:60px;height:4px;background:${escapeHtml(accentColor)};border-radius:2px;margin:0 auto 20px"></div>
    <p style="font-size:17px;color:${escapeHtml(textColor)};max-width:600px;margin:0 auto">${escapeHtml(sectionDescription)}</p>
  </div>`

  const cardsHtml = segments.map((seg) => `<div style="background:white;border-radius:20px;padding:36px 28px;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,0.06);transition:transform 0.3s ease,box-shadow 0.3s ease">
    <div style="width:90px;height:90px;background:linear-gradient(145deg,${escapeHtml(primaryLight)} 0%,${escapeHtml(primaryLighter)} 100%);border-radius:24px;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;font-size:40px;border:2px solid ${escapeHtml(primaryAlpha10)}">${escapeHtml(seg.icon)}</div>
    <h3 style="font-size:18px;font-weight:700;color:${escapeHtml(titleColor)};margin-bottom:10px">${escapeHtml(seg.titulo)}</h3>
    <p style="font-size:14px;color:${escapeHtml(textColor)};line-height:1.6;margin:0">${escapeHtml(seg.descricao)}</p>
  </div>`).join('\n')

  const bgStyle = bgTo ? `linear-gradient(180deg,${escapeHtml(bg)} 0%,${escapeHtml(bgTo)} 100%)` : bg
  const idAttr = sectionId ? ` id="${escapeHtml(sectionId)}"` : ''

  return `<section${idAttr} class="lp-animate lp-stagger" style="width:100%;background:${bgStyle};padding:${paddingY}px clamp(16px,5vw,40px)">
  <div style="max-width:${escapeHtml(maxWidth)};margin:0 auto">
    ${headerHtml}
    <div class="lp-segments-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px">
      ${cardsHtml}
    </div>
  </div>
</section>`
}

// ── Stats Band ──
// Espelha: StatsBandComponent.tsx

function renderStatsBand(props: Record<string, unknown>): string {
  const bg = (props.background as string) || '#111827'
  const accent = (props.accentColor as string) || '#ffffff'
  const labelColor = (props.labelColor as string) || 'rgba(255,255,255,0.7)'
  const paddingY = (props.paddingY as number) ?? 40
  const showDivider = (props.showDivider as boolean) ?? true
  const showGlow = (props.showGlow as boolean) ?? true
  const fontSize = (props.fontSize as number) ?? 56
  const labelFontSize = (props.labelFontSize as number) ?? 12
  const fontWeight = (props.fontWeight as string) || '900'
  const labelLetterSpacing = (props.labelLetterSpacing as number) ?? 2

  const stats = (props.stats as Array<{ valor: string; label: string }>) || [
    { valor: '10+', label: 'anos de experiência' },
    { valor: '500+', label: 'clientes atendidos' },
    { valor: '98%', label: 'de satisfação' },
  ]

  const glowStyle = showGlow ? 'text-shadow:0 0 30px rgba(255,255,255,0.5),0 0 60px rgba(255,255,255,0.3);' : ''

  const itemsHtml = stats.map((s, i) => {
    const hasDivider = showDivider && i < stats.length - 1
    const dividerHtml = hasDivider
      ? `<div style="position:absolute;right:0;top:50%;transform:translateY(-50%);width:1px;height:50%;background:linear-gradient(to bottom,transparent,rgba(255,255,255,0.3),transparent)"></div>`
      : ''
    return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:${paddingY}px 24px;position:relative">
      ${dividerHtml}
      <span data-lp-counter="${escapeHtml(s.valor)}" style="font-size:clamp(36px,6vw,${fontSize}px);font-weight:${fontWeight};color:${escapeHtml(accent)};letter-spacing:-2px;line-height:1;margin-bottom:8px;${glowStyle}">${escapeHtml(s.valor)}</span>
      <span style="font-size:clamp(11px,1.5vw,${labelFontSize}px);font-weight:600;color:${escapeHtml(labelColor)};text-transform:uppercase;letter-spacing:${labelLetterSpacing}px;line-height:1.4;text-align:center">${escapeHtml(s.label)}</span>
    </div>`
  }).join('\n')

  return `<section class="lp-animate" style="width:100%;background:${escapeHtml(bg)};padding:0">
  <div class="lp-stats-grid" style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(${stats.length},1fr);gap:0">${itemsHtml}</div>
</section>`
}

// ── Testimonials Grid ──
// Espelha: TestimonialsGridComponent.tsx

function renderTestimonialsGrid(props: Record<string, unknown>): string {
  const bg = (props.background as string) || '#f8fafc'
  const cardBg = (props.cardBackground as string) || '#ffffff'
  const accent = (props.accentColor as string) || '#f59e0b'
  const textColor = (props.textColor as string) || '#0f172a'
  const paddingY = (props.paddingY as number) ?? 80
  const showStars = (props.showStars as boolean) ?? true
  const sectionTag = (props.sectionTag as string) || 'DEPOIMENTOS'
  const sectionTitle = (props.sectionTitle as string) || 'O que nossos clientes dizem'
  const depoimentos = (props.depoimentos as Array<{
    nomeCliente: string; cargo: string; citacao: string; nota: number; accentColor?: string
  }>) || []

  const headerHtml = `<div style="text-align:center;margin-bottom:48px">
    <p style="font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${escapeHtml(accent)};margin:0 0 12px">${escapeHtml(sectionTag)}</p>
    <h2 style="font-size:clamp(28px,4vw,40px);font-weight:800;color:${escapeHtml(textColor)};margin:0;letter-spacing:-0.5px;line-height:1.2">${escapeHtml(sectionTitle)}</h2>
  </div>`

  const cardsHtml = depoimentos.map((d) => {
    const stars = showStars
      ? `<div style="display:flex;gap:2px">${Array.from({ length: 5 }, (_, i) =>
          `<span style="color:${i < d.nota ? escapeHtml(d.accentColor || accent) : '#e2e8f0'};font-size:16px">\u2605</span>`
        ).join('')}</div>`
      : ''
    return `<div style="background:${escapeHtml(cardBg)};border-radius:16px;padding:clamp(20px,4vw,32px);display:flex;flex-direction:column;gap:20px;box-shadow:0 2px 12px rgba(0,0,0,0.06);border-top:3px solid ${escapeHtml(d.accentColor || accent)}">
      ${stars}
      <p style="font-size:15px;font-style:italic;color:#475569;line-height:1.7;margin:0;flex:1">\u201C${escapeHtml(d.citacao)}\u201D</p>
      <div style="border-top:1px solid #f1f5f9;padding-top:16px">
        <p style="font-size:15px;font-weight:700;color:${escapeHtml(textColor)};margin:0 0 2px">${escapeHtml(d.nomeCliente)}</p>
        <p style="font-size:13px;font-weight:500;color:${escapeHtml(d.accentColor || accent)};margin:0">${escapeHtml(d.cargo)}</p>
      </div>
    </div>`
  }).join('\n')

  return `<section class="lp-animate lp-stagger" style="width:100%;background:${escapeHtml(bg)};padding:${paddingY}px clamp(16px,5vw,80px)">
  <div style="max-width:1200px;margin:0 auto">
    ${headerHtml}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr));gap:clamp(16px,3vw,24px)">${cardsHtml}</div>
  </div>
</section>`
}

// ── Social Links ──

const SOCIAL_SVG: Record<string, string> = {
  instagram: '<path d="M7.8 2h8.4C19 2 22 5 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C5 22 2 19 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5M12 7a5 5 0 110 10 5 5 0 010-10m0 2a3 3 0 100 6 3 3 0 000-6z"/>',
  facebook: '<path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z"/>',
  linkedin: '<path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 2a2 2 0 110 4 2 2 0 010-4z"/>',
  youtube: '<path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29.94 29.94 0 001 12a29.94 29.94 0 00.46 5.58 2.78 2.78 0 001.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2A29.94 29.94 0 0023 12a29.94 29.94 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/>',
  twitter: '<path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>',
  site: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>',
}

function renderSocialLinks(props: Record<string, unknown>): string {
  const links = (props.links as Array<{ platform: string; url: string }>) || []
  const iconColor = (props.iconColor as string) || '#9ca3af'
  const iconSize = (props.iconSize as number) || 22
  const gap = (props.gap as number) || 16
  const justify = (props.justifyContent as string) || 'center'

  const iconsHtml = links.map((l) => {
    const svgContent = SOCIAL_SVG[l.platform] || SOCIAL_SVG.site
    const fillOrStroke = ['instagram', 'site'].includes(l.platform)
      ? `fill="none" stroke="${escapeHtml(iconColor)}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"`
      : `fill="${escapeHtml(iconColor)}"`
    return `<a href="${escapeHtml(l.url)}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;opacity:0.8">
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" ${fillOrStroke}>${svgContent}</svg>
    </a>`
  }).join('\n')

  return `<div style="display:flex;align-items:center;justify-content:${justify};gap:${gap}px;flex-wrap:wrap">${iconsHtml}</div>`
}

// ── Bento Features ──

function renderBentoFeatures(props: Record<string, unknown>): string {
  const bg = (props.background as string) || '#f8fafc'
  const cardBg = (props.cardBackground as string) || '#ffffff'
  const cardRadius = (props.cardRadius as number) ?? 16
  const paddingY = (props.paddingY as number) ?? 72
  const items = (props.items as Array<{
    icon: string; titulo: string; descricao: string; size: 'normal' | 'wide'; accentColor: string
  }>) || []

  const cardsHtml = items.map((item) => {
    const span = item.size === 'wide' ? 'grid-column:1/-1;' : ''
    return `<div style="${span}background:${escapeHtml(cardBg)};border-radius:${cardRadius}px;padding:clamp(20px,4vw,32px);display:flex;flex-direction:column;gap:12px;box-shadow:0 2px 15px rgba(0,0,0,0.06);border-top:3px solid ${escapeHtml(item.accentColor)}">
      <span style="font-size:32px">${escapeHtml(item.icon)}</span>
      <h3 style="font-size:18px;font-weight:700;color:#1e293b">${escapeHtml(item.titulo)}</h3>
      <p style="font-size:15px;color:#64748b;line-height:1.6">${escapeHtml(item.descricao)}</p>
    </div>`
  }).join('\n')

  return `<section class="lp-animate lp-stagger" style="width:100%;background:${escapeHtml(bg)};padding:${paddingY}px clamp(16px,5vw,40px)">
  <div style="max-width:900px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:clamp(16px,3vw,24px)">${cardsHtml}</div>
</section>`
}

// ── Quote Highlight ──

function renderQuoteHighlight(props: Record<string, unknown>): string {
  const quote = (props.quote as string) || ''
  const author = (props.author as string) || ''
  const role = (props.role as string) || ''
  const bg = (props.background as string) || '#0f172a'
  const textColor = (props.textColor as string) || '#ffffff'
  const accent = (props.accentColor as string) || '#f59e0b'
  const paddingY = (props.paddingY as number) ?? 80

  return `<section class="lp-animate lp-stagger" style="width:100%;background:${escapeHtml(bg)};padding:${paddingY}px clamp(24px,5vw,80px);position:relative;overflow:hidden">
  <div style="position:absolute;top:-40px;left:20px;font-size:220px;opacity:0.08;color:${escapeHtml(accent)};font-family:Georgia,serif;line-height:1;pointer-events:none">\u201C</div>
  <div style="max-width:800px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:28px;position:relative;z-index:1;text-align:center">
    <div style="width:48px;height:3px;background:${escapeHtml(accent)}"></div>
    <p style="font-size:clamp(18px,3vw,26px);font-weight:400;font-style:italic;color:${escapeHtml(textColor)};line-height:1.7">\u201C${escapeHtml(quote)}\u201D</p>
    <div>
      <p style="font-size:16px;font-weight:700;color:${escapeHtml(accent)}">${escapeHtml(author)}</p>
      <p style="font-size:13px;font-weight:500;color:${escapeHtml(textColor)};opacity:0.6;text-transform:uppercase;letter-spacing:1px">${escapeHtml(role)}</p>
    </div>
  </div>
</section>`
}

// ── Spacer ──
// Espelha: SpacerComponent.tsx

function renderSpacer(props: Record<string, unknown>): string {
  const height = (props.height as number) || 40
  return `<div style="width:100%;height:${height}px" aria-hidden="true"></div>`
}

// ── Columns ──
// Espelha: ColumnsComponent.tsx

const COLUMNS_LAYOUTS: Record<string, number[]> = {
  '100': [1],
  '50-50': [1, 1],
  '33-33-33': [1, 1, 1],
  '25-25-25-25': [1, 1, 1, 1],
  '70-30': [7, 3],
  '30-70': [3, 7],
  '25-50-25': [1, 2, 1],
}

function renderColumns(props: Record<string, unknown>, _children: string, node: CraftNodeData, tree: CraftTree): string {
  const layout = (props.layout as string) || '50-50'
  const gap = (props.gap as number) ?? 16
  const bg = (props.background as string) || 'transparent'
  const padding = (props.padding as number) ?? 0
  const minHeight = (props.minHeight as number) || 80

  const ratios = COLUMNS_LAYOUTS[layout] || [1, 1]
  const totalRatio = ratios.reduce((a, b) => a + b, 0)

  // Renderiza filhos das linkedNodes (cada coluna é uma linkedNode canvas)
  const columnsHtml = ratios.map((ratio, i) => {
    const linkedKey = `column-${i}`
    const linkedNodeId = node.linkedNodes?.[linkedKey]
    let colContent = ''
    if (linkedNodeId) {
      const linkedNode = tree[linkedNodeId]
      if (linkedNode) {
        colContent = linkedNode.nodes.map((id) => renderNode(id, tree)).join('\n')
      }
    }
    const flex = `${ratio / totalRatio}`
    return `<div style="flex:${flex};min-width:0">${colContent}</div>`
  }).join('\n')

  return `<div class="lp-cols" style="display:flex;flex-wrap:wrap;gap:${gap}px;background:${escapeHtml(bg)};padding:${padding}px;min-height:${minHeight}px">${columnsHtml}</div>`
}

// ── Icon ──
// Espelha: IconComponent.tsx — usa SVG inline (sem Phosphor React)

const ICON_SVG_MAP: Record<string, string> = {
  star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
  heart: '<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>',
  check: '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  award: '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  users: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
  phone: '<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>',
  mappin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>',
  globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>',
  briefcase: '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>',
  book: '<path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>',
  rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  coffee: '<path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>',
  gift: '<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>',
  thumbsup: '<path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/>',
  trending: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  building: '<rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><line x1="8" y1="6" x2="8" y2="6"/><line x1="12" y1="6" x2="12" y2="6"/><line x1="16" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8" y2="10"/><line x1="12" y1="10" x2="12" y2="10"/><line x1="16" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="8" y2="14"/><line x1="12" y1="14" x2="12" y2="14"/><line x1="16" y1="14" x2="16" y2="14"/>',
  calculator: '<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="10" y2="18"/><line x1="14" y1="18" x2="16" y2="18"/>',
  wallet: '<path d="M20 12V8H6a2 2 0 01-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12a2 2 0 002 2h14V12"/><circle cx="18" cy="12" r="1"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  handshake: '<path d="M20 11L7.83 11l3.58-3.59L10 6l-6 6 6 6 1.41-1.41L7.83 13H20v-2z"/>',
}

function renderIcon(props: Record<string, unknown>): string {
  const icon = (props.icon as string) || 'star'
  const size = (props.size as number) || 32
  const color = (props.color as string) || '#2563eb'
  const bgColor = (props.backgroundColor as string) || '#eff6ff'
  const shape = (props.shape as string) || 'rounded'
  const padding = (props.padding as number) ?? 16

  const borderRadius = shape === 'circle' ? '50%' : shape === 'rounded' ? '12px' : shape === 'square' ? '4px' : undefined
  const totalSize = shape !== 'none' ? size + padding * 2 : size
  const hasBg = shape !== 'none'

  const svgPath = ICON_SVG_MAP[icon] || ICON_SVG_MAP.star
  const svgHtml = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${escapeHtml(color)}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svgPath}</svg>`

  return `<div style="display:inline-flex;align-items:center;justify-content:center;width:${totalSize}px;height:${totalSize}px;min-width:${totalSize}px;min-height:${totalSize}px;background-color:${hasBg ? escapeHtml(bgColor) : 'transparent'};border-radius:${borderRadius || '0'};color:${escapeHtml(color)}">${svgHtml}</div>`
}

// ── IconList ──
// Espelha: IconListComponent.tsx

const ICON_LIST_SVG: Record<string, string> = {
  check: '<polyline points="20 6 9 17 4 12"/>',
  'check-circle': '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  chevron: '<polyline points="9 18 15 12 9 6"/>',
  arrow: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  dash: '<line x1="5" y1="12" x2="19" y2="12"/>',
}

function renderIconList(props: Record<string, unknown>): string {
  const items = (props.items as Array<{ text: string }>) || []
  const iconType = (props.iconType as string) || 'check-circle'
  const iconColor = (props.iconColor as string) || '#16a34a'
  const iconSize = (props.iconSize as number) || 18
  const textColor = (props.textColor as string) || '#374151'
  const fontSize = (props.fontSize as number) || 15
  const gap = (props.gap as number) ?? 12
  const lineHeight = (props.lineHeight as number) ?? 1.5

  const svgPath = ICON_LIST_SVG[iconType] || ICON_LIST_SVG['check-circle']
  const iconSvg = `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${escapeHtml(iconColor)}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:2px">${svgPath}</svg>`

  const itemsHtml = items.map((item) =>
    `<div style="display:flex;align-items:flex-start;gap:10px">${iconSvg}<span style="color:${escapeHtml(textColor)};font-size:${fontSize}px;line-height:${lineHeight}">${escapeHtml(item.text)}</span></div>`,
  ).join('\n')

  return `<div style="display:flex;flex-direction:column;gap:${gap}px;width:100%">${itemsHtml}</div>`
}

// ── StarRating ──
// Espelha: StarRatingComponent.tsx

function renderStarRating(props: Record<string, unknown>): string {
  const rating = (props.rating as number) ?? 4.5
  const maxStars = (props.maxStars as number) || 5
  const size = (props.size as number) || 24
  const filledColor = (props.filledColor as string) || '#f59e0b'
  const emptyColor = (props.emptyColor as string) || '#e5e7eb'
  const gap = (props.gap as number) ?? 4
  const showLabel = (props.showLabel as boolean) ?? true
  const labelColor = (props.labelColor as string) || '#374151'
  const labelSize = (props.labelSize as number) || 16

  const starSvg = (fill: string) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${escapeHtml(fill)}" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`

  let starsHtml = ''
  for (let i = 0; i < maxStars; i++) {
    const fill = i + 1 <= rating ? 1 : i < rating ? rating - i : 0
    if (fill >= 1) {
      starsHtml += starSvg(filledColor)
    } else if (fill > 0) {
      // Half star — overlay clipping
      const pct = Math.round(fill * 100)
      starsHtml += `<span style="position:relative;display:inline-block;width:${size}px;height:${size}px">`
      starsHtml += `<span style="position:absolute;inset:0;overflow:hidden;width:${pct}%">${starSvg(filledColor)}</span>`
      starsHtml += `<span style="position:absolute;inset:0">${starSvg(emptyColor)}</span>`
      starsHtml += `</span>`
    } else {
      starsHtml += starSvg(emptyColor)
    }
  }

  const labelHtml = showLabel
    ? `<span style="font-size:${labelSize}px;color:${escapeHtml(labelColor)};font-weight:600;margin-left:8px">${rating}</span>`
    : ''

  return `<div style="display:inline-flex;align-items:center;gap:${gap}px">${starsHtml}${labelHtml}</div>`
}

// ── NumberCounter ──
// Espelha: NumberCounterComponent.tsx

function renderNumberCounter(props: Record<string, unknown>): string {
  const value = (props.value as string) || '500'
  const label = (props.label as string) || ''
  const prefix = (props.prefix as string) || ''
  const suffix = (props.suffix as string) || '+'
  const fontSize = (props.fontSize as number) || 48
  const labelSize = (props.labelSize as number) || 14
  const color = (props.color as string) || '#2563eb'
  const labelColor = (props.labelColor as string) || '#6b7280'
  const fontWeight = (props.fontWeight as number) || 900
  const textAlign = (props.textAlign as string) || 'center'

  const display = `${prefix}${value}${suffix}`
  const labelHtml = label
    ? `<div style="font-size:${labelSize}px;color:${escapeHtml(labelColor)};text-transform:uppercase;letter-spacing:0.5px;font-weight:500">${escapeHtml(label)}</div>`
    : ''

  return `<div style="text-align:${textAlign};width:100%">
  <div data-lp-counter="${escapeHtml(display)}" style="font-size:${fontSize}px;font-weight:${fontWeight};color:${escapeHtml(color)};line-height:1.1">${escapeHtml(display)}</div>
  ${labelHtml}
</div>`
}

// ── ProgressBar ──
// Espelha: ProgressBarComponent.tsx

function renderProgressBar(props: Record<string, unknown>): string {
  const label = (props.label as string) || 'Progresso'
  const percentage = (props.percentage as number) ?? 75
  const barColor = (props.barColor as string) || '#2563eb'
  const trackColor = (props.trackColor as string) || '#e5e7eb'
  const textColor = (props.textColor as string) || '#374151'
  const height = (props.height as number) || 12
  const borderRadius = (props.borderRadius as number) ?? 50
  const showPercentage = (props.showPercentage as boolean) ?? true
  const fontSize = (props.fontSize as number) || 14

  const headerHtml = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
  <span style="font-size:${fontSize}px;font-weight:500;color:${escapeHtml(textColor)}">${escapeHtml(label)}</span>
  ${showPercentage ? `<span style="font-size:${fontSize}px;font-weight:600;color:${escapeHtml(textColor)}">${percentage}%</span>` : ''}
</div>`

  return `<div style="width:100%">
  ${headerHtml}
  <div style="width:100%;height:${height}px;background:${escapeHtml(trackColor)};border-radius:${borderRadius}px;overflow:hidden">
    <div style="width:${percentage}%;height:100%;background:${escapeHtml(barColor)};border-radius:${borderRadius}px;transition:width 0.6s ease"></div>
  </div>
</div>`
}

// ── Alert ──
// Espelha: AlertComponent.tsx

const ALERT_ICON_SVG: Record<string, string> = {
  info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  success: '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  warning: '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  error: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
}

function renderAlert(props: Record<string, unknown>): string {
  const text = (props.text as string) || ''
  const title = (props.title as string) || ''
  const variant = (props.variant as string) || 'info'
  const showIcon = (props.showIcon as boolean) ?? true
  const borderStyle = (props.borderStyle as string) || 'left'
  const bgColor = (props.backgroundColor as string) || '#eff6ff'
  const textColor = (props.textColor as string) || '#1e40af'
  const iconColor = (props.iconColor as string) || '#3b82f6'
  const borderColor = (props.borderColor as string) || '#3b82f6'
  const fontSize = (props.fontSize as number) || 14

  const borderCss = borderStyle === 'left'
    ? `border-left:4px solid ${escapeHtml(borderColor)}`
    : borderStyle === 'full'
      ? `border:1px solid ${escapeHtml(borderColor)}`
      : ''

  const svgPath = ALERT_ICON_SVG[variant] || ALERT_ICON_SVG.info
  const iconHtml = showIcon
    ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${escapeHtml(iconColor)}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:2px">${svgPath}</svg>`
    : ''

  const titleHtml = title
    ? `<div style="font-weight:600;font-size:${fontSize}px;color:${escapeHtml(textColor)};margin-bottom:4px">${escapeHtml(title)}</div>`
    : ''

  return `<div style="display:flex;gap:12px;padding:16px;background:${escapeHtml(bgColor)};border-radius:8px;${borderCss};width:100%">
  ${iconHtml}
  <div style="flex:1">
    ${titleHtml}
    <div style="font-size:${fontSize}px;color:${escapeHtml(textColor)};line-height:1.6">${escapeHtml(text)}</div>
  </div>
</div>`
}

// ── ImageGallery ──
// Espelha: ImageGalleryComponent.tsx

function renderImageGallery(props: Record<string, unknown>): string {
  const images = (props.images as Array<{ src: string; alt: string }>) || []
  const columns = (props.columns as number) || 3
  const gap = (props.gap as number) ?? 8
  const borderRadius = (props.borderRadius as number) ?? 8
  const imageHeight = (props.imageHeight as number) || 200
  const objectFit = (props.objectFit as string) || 'cover'
  const bg = (props.background as string) || 'transparent'

  const imagesHtml = images.map((img) =>
    `<div style="border-radius:${borderRadius}px;overflow:hidden;height:${imageHeight}px">` +
    `<img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt || 'Imagem')}" loading="lazy" ` +
    `style="width:100%;height:100%;object-fit:${objectFit};display:block;transition:transform 0.3s ease" /></div>`,
  ).join('\n')

  return `<div class="lp-gallery-grid" style="display:grid;grid-template-columns:repeat(${columns},1fr);gap:${gap}px;background:${escapeHtml(bg)};width:100%">${imagesHtml}</div>`
}

// ── ImageCarousel ──
// Espelha: ImageCarouselComponent.tsx — renderiza primeiro slide (sem JS interativo)

function renderImageCarousel(props: Record<string, unknown>): string {
  const slides = (props.slides as Array<{ src: string; alt: string; caption: string }>) || []
  const height = (props.height as number) || 350
  const borderRadius = (props.borderRadius as number) ?? 12
  const objectFit = (props.objectFit as string) || 'cover'
  const showCaptions = (props.showCaptions as boolean) ?? true
  const showDots = (props.showDots as boolean) ?? true
  const dotColor = (props.dotColor as string) || '#ffffff'

  if (slides.length === 0) {
    return `<div style="width:100%;height:${height}px;border-radius:${borderRadius}px;background:#e5e7eb;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:14px">Carrossel vazio</div>`
  }

  const first = slides[0]
  const captionHtml = showCaptions && first.caption
    ? `<div style="position:absolute;bottom:0;left:0;right:0;padding:20px;background:linear-gradient(transparent,rgba(0,0,0,0.7))"><p style="color:#fff;font-size:14px;font-weight:500">${escapeHtml(first.caption)}</p></div>`
    : ''

  const dotsHtml = showDots && slides.length > 1
    ? `<div style="position:absolute;bottom:12px;left:50%;transform:translateX(-50%);display:flex;gap:6px">${slides.map((_, i) =>
      `<span style="width:${i === 0 ? '20px' : '8px'};height:8px;border-radius:4px;background:${escapeHtml(dotColor)};opacity:${i === 0 ? 1 : 0.5}"></span>`,
    ).join('')}</div>`
    : ''

  return `<div style="position:relative;width:100%;height:${height}px;border-radius:${borderRadius}px;overflow:hidden">
  <img src="${escapeHtml(first.src)}" alt="${escapeHtml(first.alt || '')}" style="width:100%;height:100%;object-fit:${objectFit};display:block" />
  ${captionHtml}${dotsHtml}
</div>`
}

// ── LogoGrid ──
// Espelha: LogoGridComponent.tsx

function renderLogoGrid(props: Record<string, unknown>): string {
  const logos = (props.logos as Array<{ src: string; alt: string; href: string }>) || []
  const columns = (props.columns as number) || 5
  const gap = (props.gap as number) ?? 24
  const logoHeight = (props.logoHeight as number) || 40
  const grayscale = (props.grayscale as boolean) ?? true
  const opacity = (props.opacity as number) ?? 0.6
  const bg = (props.background as string) || 'transparent'
  const padding = (props.padding as number) ?? 24
  const title = (props.title as string) || ''
  const titleColor = (props.titleColor as string) || '#9ca3af'
  const titleSize = (props.titleSize as number) || 13

  const titleHtml = title
    ? `<p style="text-align:center;font-size:${titleSize}px;color:${escapeHtml(titleColor)};text-transform:uppercase;letter-spacing:1px;font-weight:600;margin-bottom:20px">${escapeHtml(title)}</p>`
    : ''

  const filterStyle = grayscale ? `filter:grayscale(1);opacity:${opacity}` : ''

  const logosHtml = logos.map((logo) => {
    const imgTag = `<img src="${escapeHtml(logo.src)}" alt="${escapeHtml(logo.alt || '')}" loading="lazy" style="height:${logoHeight}px;width:auto;object-fit:contain;display:block;${filterStyle}" />`
    if (logo.href) {
      return `<a href="${escapeHtml(logo.href)}" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;justify-content:center">${imgTag}</a>`
    }
    return `<div style="display:flex;align-items:center;justify-content:center">${imgTag}</div>`
  }).join('\n')

  return `<div style="width:100%;background:${escapeHtml(bg)};padding:${padding}px">
  ${titleHtml}
  <div class="lp-logo-grid" style="display:grid;grid-template-columns:repeat(${columns},1fr);gap:${gap}px;align-items:center;justify-items:center">${logosHtml}</div>
</div>`
}

// ── BeforeAfter ──
// Espelha: BeforeAfterComponent.tsx — export estático no initialPosition

function renderBeforeAfter(props: Record<string, unknown>): string {
  const beforeSrc = (props.beforeSrc as string) || ''
  const afterSrc = (props.afterSrc as string) || ''
  const beforeLabel = (props.beforeLabel as string) || 'Antes'
  const afterLabel = (props.afterLabel as string) || 'Depois'
  const height = (props.height as number) || 350
  const borderRadius = (props.borderRadius as number) ?? 12
  const sliderColor = (props.sliderColor as string) || '#ffffff'
  const labelBg = (props.labelBackground as string) || 'rgba(0,0,0,0.6)'
  const labelColor = (props.labelColor as string) || '#ffffff'
  const position = (props.initialPosition as number) ?? 50

  const labelStyle = `position:absolute;bottom:16px;padding:4px 12px;border-radius:4px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:${escapeHtml(labelColor)};background:${escapeHtml(labelBg)}`

  return `<div style="position:relative;width:100%;height:${height}px;border-radius:${borderRadius}px;overflow:hidden;user-select:none">
  <img src="${escapeHtml(afterSrc)}" alt="${escapeHtml(afterLabel)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" />
  <div style="position:absolute;inset:0;width:${position}%;overflow:hidden">
    <img src="${escapeHtml(beforeSrc)}" alt="${escapeHtml(beforeLabel)}" style="width:100%;height:100%;object-fit:cover" />
  </div>
  <div style="position:absolute;top:0;bottom:0;left:${position}%;width:3px;background:${escapeHtml(sliderColor)};transform:translateX(-50%)">
    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:36px;height:36px;border-radius:50%;background:${escapeHtml(sliderColor)};box-shadow:0 2px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
    </div>
  </div>
  <span style="${labelStyle};left:16px">${escapeHtml(beforeLabel)}</span>
  <span style="${labelStyle};right:16px">${escapeHtml(afterLabel)}</span>
</div>`
}

// ── Tabs ──
// Espelha: TabsComponent.tsx — export renderiza todas as tabs abertas (sem JS)

function renderTabs(props: Record<string, unknown>): string {
  const tabs = (props.tabs as Array<{ label: string; content: string }>) || []
  const tabStyle = (props.tabStyle as string) || 'underline'
  const bg = (props.background as string) || '#ffffff'
  const tabColor = (props.tabColor as string) || '#6b7280'
  const activeColor = (props.activeColor as string) || '#2563eb'
  const textColor = (props.textColor as string) || '#374151'
  const contentPadding = (props.contentPadding as number) ?? 24
  const fontSize = (props.fontSize as number) || 15

  if (tabs.length === 0) return ''

  // Renderiza header com primeira tab ativa
  const headerHtml = tabs.map((tab, i) => {
    const isActive = i === 0
    let btnStyle = `padding:10px 20px;font-size:${fontSize}px;font-weight:${isActive ? 600 : 500};cursor:pointer;border:none;background:none;`
    if (tabStyle === 'underline') {
      btnStyle += `color:${escapeHtml(isActive ? activeColor : tabColor)};border-bottom:2px solid ${isActive ? escapeHtml(activeColor) : 'transparent'}`
    } else if (tabStyle === 'pills') {
      btnStyle += isActive
        ? `color:#fff;background:${escapeHtml(activeColor)};border-radius:50px`
        : `color:${escapeHtml(tabColor)};border-radius:50px`
    } else {
      btnStyle += isActive
        ? `color:${escapeHtml(activeColor)};border:1px solid ${escapeHtml(activeColor)};border-radius:6px`
        : `color:${escapeHtml(tabColor)};border:1px solid #e5e7eb;border-radius:6px`
    }
    return `<button style="${btnStyle}">${escapeHtml(tab.label)}</button>`
  }).join('\n')

  // Mostra conteúdo da primeira tab
  const contentHtml = tabs[0]?.content
    ? `<div style="padding:${contentPadding}px;font-size:${fontSize}px;color:${escapeHtml(textColor)};line-height:1.6">${escapeHtml(tabs[0].content)}</div>`
    : ''

  return `<div style="width:100%;background:${escapeHtml(bg)};border-radius:8px;overflow:hidden">
  <div style="display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid #e5e7eb">${headerHtml}</div>
  ${contentHtml}
</div>`
}

// ── Accordion ──
// Espelha: AccordionComponent.tsx — export com todos os itens abertos

function renderAccordion(props: Record<string, unknown>): string {
  const items = (props.items as Array<{ titulo: string; conteudo: string }>) || []
  const accStyle = (props.style as string) || 'bordered'
  const bg = (props.background as string) || '#ffffff'
  const accentColor = (props.accentColor as string) || '#2563eb'
  const textColor = (props.textColor as string) || '#374151'
  const gap = (props.gap as number) ?? 8
  const fontSize = (props.fontSize as number) || 15

  const itemsHtml = items.map((item) => {
    let itemStyle = `border-radius:8px;overflow:hidden;`
    if (accStyle === 'bordered') {
      itemStyle += `border:1px solid #e5e7eb;background:${escapeHtml(bg)}`
    } else if (accStyle === 'filled') {
      itemStyle += `background:#f3f4f6`
    } else {
      itemStyle += `border-bottom:1px solid #e5e7eb;border-radius:0`
    }

    return `<div style="${itemStyle}">
  <div style="display:flex;align-items:center;justify-content:space-between;padding:16px;cursor:pointer">
    <span style="font-size:${fontSize}px;font-weight:600;color:${escapeHtml(accentColor)}">${escapeHtml(item.titulo)}</span>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${escapeHtml(accentColor)}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(180deg)"><polyline points="6 9 12 15 18 9"/></svg>
  </div>
  <div style="padding:0 16px 16px;font-size:${fontSize}px;color:${escapeHtml(textColor)};line-height:1.6">${escapeHtml(item.conteudo)}</div>
</div>`
  }).join('\n')

  return `<div style="display:flex;flex-direction:column;gap:${gap}px;width:100%">${itemsHtml}</div>`
}

// ─── Exportação principal ────────────────────────────────────────

/** Detecta fontFamily no nó ROOT e gera link do Google Fonts se aplicável */
function buildFontLink(tree: CraftTree): string {
  const rootFont = tree.ROOT?.props?.fontFamily as string | undefined
  if (!rootFont) return ''
  const clean = rootFont.split(',')[0].trim().replace(/['"]/g, '')
  if (!clean || clean.includes(' ') === false && clean.length > 40) return ''
  const systemFonts = new Set(['system-ui', 'sans-serif', 'serif', 'monospace', 'cursive', 'Arial', 'Verdana', 'Georgia', 'Times', 'Courier'])
  if (systemFonts.has(clean)) return ''
  const encoded = encodeURIComponent(clean)
  return `\n  <link rel="preconnect" href="https://fonts.googleapis.com" />\n  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${encoded}:wght@400;500;600;700;800&display=swap" />`
}

/**
 * Converte o JSON serializado do Craft.js em um documento HTML completo.
 */
export function craftJsonToHtml(
  json: string,
  options: ExportOptions = {},
): ExportResult {
  const { pageTitle = 'Minha Landing Page', externalCss = false } = options

  const tree: CraftTree = JSON.parse(json)

  if (!tree.ROOT) {
    return { html: '<!-- Nenhum conteúdo para exportar -->', css: null }
  }

  const bodyContent = renderNode('ROOT', tree)
  const fontLink = buildFontLink(tree)

  const hasLocalUrls = /src="http:\/\/(localhost|127\.0\.0\.1)[^"]*"/.test(bodyContent)
  const localUrlWarning = hasLocalUrls
    ? '\n  <!-- ⚠️ ATENÇÃO: Esta página contém imagens hospedadas no servidor local (localhost). -->\n  <!-- Para que funcionem em produção, faça upload das imagens e atualize as URLs. -->\n'
    : ''

  if (externalCss) {
    const css = CSS_RESET + '\n' + ANIMATION_CSS
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(pageTitle)}</title>${fontLink}
  <link rel="stylesheet" href="styles.css" />${localUrlWarning}
</head>
<body>
${bodyContent}
<script>${ANIMATION_JS}</script>
</body>
</html>`
    return { html, css }
  }

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(pageTitle)}</title>${fontLink}
  <style>${CSS_RESET}${ANIMATION_CSS}</style>${localUrlWarning}
</head>
<body>
${bodyContent}
<script>${ANIMATION_JS}</script>
</body>
</html>`

  return { html, css: null }
}

/**
 * Gera somente o fragmento HTML do body (sem <html>, <head>, etc.).
 */
export function craftJsonToHtmlFragment(json: string): string {
  const tree: CraftTree = JSON.parse(json)
  if (!tree.ROOT) return ''
  return renderNode('ROOT', tree)
}
