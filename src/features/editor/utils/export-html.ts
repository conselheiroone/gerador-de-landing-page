/**
 * Utilitário de exportação: converte JSON serializado do Craft.js em HTML + CSS estático.
 *
 * Percorre a árvore de nós e gera HTML semântico com estilos inline,
 * produzindo uma página responsiva pronta para deploy.
 *
 * IMPORTANTE: cada render function deve espelhar fielmente o componente React
 * correspondente em src/features/editor/components/user-components/.
 */

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
html{-webkit-text-size-adjust:100%;line-height:1.5;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
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
  const radius = props.radius as number
  const flexDirection = (props.flexDirection as string) || 'column'
  const hasImage = !!bgImage
  const hasOverlay = hasImage && overlayOpacity > 0

  const shadowMap: Record<string, string> = {
    none: 'none',
    soft: '0 2px 15px rgba(0,0,0,0.06)',
    elevated: '0 8px 30px rgba(0,0,0,0.12)',
    dramatic: '0 20px 60px rgba(0,0,0,0.25)',
  }
  const resolvedShadow =
    shadowPreset && shadowPreset !== 'none'
      ? shadowMap[shadowPreset]
      : (props.shadow as number) === 0
        ? 'none'
        : `0px 3px 100px ${props.shadow}px rgba(0,0,0,0.13)`

  const borderTopStyle = borderAccent && borderAccentPos === 'top' ? `4px solid ${borderAccent}` : undefined
  const borderLeftStyle = borderAccent && borderAccentPos === 'left' ? `4px solid ${borderAccent}` : undefined

  const outerStyle = styleObj({
    position: 'relative',
    width: isPixel ? '100%' : width,
    maxWidth: isPixel ? width : undefined,
    margin: isPixel ? '0 auto' : undefined,
    height,
    borderRadius: radius,
    boxShadow: resolvedShadow,
    overflow: hasImage ? 'hidden' : undefined,
    borderTop: borderTopStyle,
    borderLeft: borderLeftStyle,
    backgroundImage: hasImage ? `url("${bgImage}")` : undefined,
    backgroundSize: hasImage ? 'cover' : undefined,
    backgroundPosition: hasImage ? 'center' : undefined,
    background: hasImage ? undefined : (props.background as string),
    fontFamily: props.fontFamily as string | undefined,
  })

  let overlayHtml = ''
  if (hasOverlay) {
    overlayHtml = `<div style="${styleObj({
      position: 'absolute',
      inset: '0',
      backgroundColor: overlayColor,
      opacity: overlayOpacity,
      borderRadius: radius,
      pointerEvents: 'none',
      zIndex: 0,
    })}"></div>`
  }

  const innerStyle = styleObj({
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection,
    flexWrap: flexDirection === 'row' ? 'wrap' : undefined,
    alignItems: (props.alignItems as string) || 'flex-start',
    justifyContent: (props.justifyContent as string) || 'flex-start',
    padding: `${props.padding || 20}px`,
    gap: `${props.gap || 10}px`,
    minHeight: `${minHeight ?? 60}px`,
    width: '100%',
    height: '100%',
  })

  const idAttr = props.sectionId ? ` id="${escapeHtml(String(props.sectionId))}"` : ''
  return `<div${idAttr} style="${outerStyle}">${overlayHtml}<div style="${innerStyle}">${children}</div></div>`
}

// ── Heading ──
// Espelha: HeadingComponent.tsx

function renderHeading(props: Record<string, unknown>): string {
  const el = (props.tagName as string) || 'h2'
  const text = (props.text as string) || ''
  const style = styleObj({
    fontSize: `${props.fontSize || 32}px`,
    textAlign: (props.textAlign as string) || 'left',
    fontWeight: (props.fontWeight as string) || '700',
    color: (props.color as string) || '#111827',
    lineHeight: (props.lineHeight as string) || '1.2',
    letterSpacing: (props.letterSpacing as string) || 'normal',
    textTransform: (props.textTransform as string) || 'none',
    maxWidth: (props.maxWidth as string) || undefined,
    width: '100%',
  })
  return tag(el, style, escapeHtml(text))
}

// ── Text ──
// Espelha: TextComponent.tsx

function renderText(props: Record<string, unknown>): string {
  const text = (props.text as string) || ''
  const margin = (props.margin as number[]) || [0, 0, 0, 0]
  const style = styleObj({
    fontSize: `${props.fontSize || 16}px`,
    textAlign: (props.textAlign as string) || 'left',
    fontWeight: (props.fontWeight as string) || '400',
    color: (props.color as string) || '#333333',
    lineHeight: (props.lineHeight as string) || undefined,
    margin: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
    width: '100%',
  })
  return tag('p', style, escapeHtml(text))
}

// ── Button ──
// Espelha: ButtonComponent.tsx

function renderButton(props: Record<string, unknown>): string {
  const text = (props.text as string) || 'Clique Aqui'
  const href = (props.href as string) || '#'
  const btnStyle = (props.buttonStyle as string) || 'filled'
  const size = (props.size as string) || 'md'
  const bg = (props.background as string) || '#2563eb'
  const color = (props.color as string) || '#ffffff'
  const radius = (props.borderRadius as number) ?? 8

  const sizeMap: Record<string, string> = {
    sm: 'padding:6px 16px;font-size:14px',
    md: 'padding:10px 24px;font-size:16px',
    lg: 'padding:14px 32px;font-size:18px',
  }

  let baseStyle = `display:inline-block;font-weight:500;text-decoration:none;cursor:pointer;border-radius:${radius}px;text-align:center;${sizeMap[size] || sizeMap.md}`

  if (btnStyle === 'filled') {
    baseStyle += `;background:${bg};color:${color};border:none`
  } else if (btnStyle === 'outline') {
    baseStyle += `;background:transparent;color:${bg};border:2px solid ${bg}`
  } else {
    baseStyle += `;background:transparent;color:${bg};border:none`
  }

  return `<a href="${escapeHtml(href)}" style="${baseStyle}">${escapeHtml(text)}</a>`
}

// ── Image ──
// Espelha: ImageComponent.tsx

function renderImage(props: Record<string, unknown>): string {
  const src = (props.src as string) || ''
  const width = (props.width as string | number) || '100%'
  const height = (props.height as string | number) || 'auto'
  const objectFit = (props.objectFit as string) || 'cover'
  const radius = props.borderRadius as number | undefined
  const bg = props.backgroundColor as string | undefined
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

  const imgStyle = styleObj({
    width: hasBg ? '100%' : width,
    height: hasBg ? '100%' : height,
    objectFit,
    borderRadius: hasBg ? undefined : radius,
    display: 'block',
  })

  const imgTag = tag('img', imgStyle, '', {
    src,
    alt: (props.alt as string) || 'Imagem',
    loading: 'lazy',
  })

  if (hasBg) {
    const wrapStyle = styleObj({
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: bg,
      borderRadius: radius,
      width,
      height: height === 'auto' ? undefined : height,
      padding: '4px',
      boxSizing: 'border-box',
    })
    return `<div style="${wrapStyle}">${imgTag}</div>`
  }

  return imgTag
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
      const containerSize = logoHeight + 8

      let wrapStyle: string
      if (isCircle && hasBg) {
        wrapStyle = `display:inline-flex;align-items:center;justify-content:center;background-color:${escapeHtml(logoBg)};border-radius:50%;width:${containerSize}px;height:${containerSize}px;overflow:hidden;flex-shrink:0`
      } else if (hasBg) {
        wrapStyle = `display:inline-flex;align-items:center;background-color:${escapeHtml(logoBg)};border-radius:8px;padding:6px 10px`
      } else {
        wrapStyle = `display:inline-flex;align-items:center`
      }

      const imgStyle = isCircle
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

  const navStyle = `width:100%;background:${escapeHtml(bg)};padding:clamp(10px,2vw,${paddingY}px) clamp(12px,4vw,${paddingX}px);display:flex;align-items:center;justify-content:${hasLogo ? 'space-between' : 'center'};flex-wrap:wrap;gap:clamp(6px,1.5vw,${paddingY}px) clamp(10px,3vw,${hasLogo ? 16 : 40}px);box-sizing:border-box;border-bottom:${escapeHtml(borderBottom)}${blurStyles}`
  const linksContainerStyle = `display:flex;align-items:center;flex-wrap:wrap;gap:clamp(8px,2.5vw,32px);justify-content:center${hasLogo ? ';flex:1 1 auto;min-width:0' : ''}`

  return `<nav style="${navStyle}">
  ${hasLogo ? `<div style="display:flex;align-items:center;flex-shrink:0;gap:10px">${logoHtml}</div>` : ''}
  <div style="${linksContainerStyle}">${linksHtml}</div>
  ${ctaHtml}
</nav>`
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

  const style = `border:none;border-top:${thickness}px ${lineStyle} ${color};margin:${marginY}px 0;width:100%`
  return `<hr style="${style}" />`
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

  const minHeightVh = props.minHeightVh as number | undefined
  const minHeightPx = (props.minHeight as number) || 200
  const resolvedMinHeight = minHeightVh ? `${minHeightVh}vh` : `${minHeightPx}px`

  // Outer section — espelha o <section> do React
  const sectionStyle = styleObj({
    position: 'relative',
    width: '100%',
    background: bg,
    backgroundImage: hasImage ? `url("${bgImage}")` : undefined,
    backgroundSize: hasImage ? 'cover' : undefined,
    backgroundPosition: hasImage ? 'center' : undefined,
    minHeight: resolvedMinHeight,
    overflow: 'hidden',
  })

  // Overlay
  let overlayHtml = ''
  if (hasOverlay) {
    overlayHtml = `<div style="${styleObj({
      position: 'absolute',
      inset: '0',
      backgroundColor: overlayColor,
      opacity: overlayOpacity,
      pointerEvents: 'none',
      zIndex: 0,
    })}"></div>`
  }

  // Inner content div
  const innerStyle = styleObj({
    position: 'relative',
    zIndex: 1,
    width: '100%',
    padding: `${props.paddingY || 60}px clamp(16px, 5vw, 40px)`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: alignMap[textAlign] || 'center',
    gap: '20px',
    minHeight: resolvedMinHeight,
    textAlign,
  })

  return `<section style="${sectionStyle}">${overlayHtml}<div style="${innerStyle}">${children}</div></section>`
}

// ── Features Section ──
// Espelha: FeaturesSectionComponent.tsx — SEM wrapGridChildrenWithSpan

function renderFeaturesSection(props: Record<string, unknown>, children: string): string {
  const cols = (props.columns as number) || 3
  const gap = (props.gap as number) || 24
  const minCol = Math.min(280, Math.max(200, Math.round(600 / cols)))

  const style = styleObj({
    width: '100%',
    background: (props.background as string) || '#ffffff',
    padding: `${props.paddingY || 60}px clamp(16px, 5vw, 40px)`,
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(${minCol}px, 1fr))`,
    gap: `${gap}px`,
    minHeight: '150px',
  })
  const attrs: Record<string, string> = {}
  if (props.sectionId) attrs.id = String(props.sectionId)
  return tag('section', style, children, attrs)
}

// ── Testimonials Section ──
// Espelha: TestimonialsSectionComponent.tsx — SEM wrapGridChildrenWithSpan, SEM cap 280

function renderTestimonialsSection(props: Record<string, unknown>, children: string): string {
  const cols = (props.columns as number) || 2
  const minCol = Math.max(250, Math.round(600 / cols))

  const style = styleObj({
    width: '100%',
    background: (props.background as string) || '#f8fafc',
    padding: `${props.paddingY || 60}px clamp(16px, 5vw, 40px)`,
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(${minCol}px, 1fr))`,
    gap: '24px',
    minHeight: '150px',
  })
  return tag('section', style, children)
}

// ── CTA Section ──
// Espelha: CtaSectionComponent.tsx

function renderCtaSection(props: Record<string, unknown>, children: string): string {
  const style = styleObj({
    width: '100%',
    background: (props.background as string) || '#2563eb',
    padding: `${props.paddingY || 50}px clamp(16px, 5vw, 40px)`,
    borderRadius: props.radius as number,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    minHeight: '120px',
    textAlign: 'center',
  })
  const ctaAttrs: Record<string, string> = {}
  if (props.sectionId) ctaAttrs.id = String(props.sectionId)
  return tag('section', style, children, ctaAttrs)
}

// ── Footer ──
// Espelha: FooterComponent.tsx — com radial-gradient e min() no grid

function renderFooter(props: Record<string, unknown>, children: string): string {
  const cols = (props.columns as number) || 3
  const minCol = Math.min(250, Math.max(180, Math.round(500 / cols)))

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

  const style = styleObj({
    width: '100%',
    background: bg,
    padding: `${props.paddingY || 40}px clamp(16px, 5vw, 40px)`,
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(min(${minCol}px, 100%), 1fr))`,
    gap: 'clamp(16px, 3vw, 30px)',
    minHeight: '100px',
  })
  return tag('footer', style, children)
}

// ── Stats Band ──
// Espelha: StatsBandComponent.tsx — borderRight (não div separado), clamp gaps

function renderStatsBand(props: Record<string, unknown>): string {
  const bg = (props.background as string) || '#111827'
  const accent = (props.accentColor as string) || '#f59e0b'
  const labelColor = (props.labelColor as string) || '#9ca3af'
  const paddingY = (props.paddingY as number) ?? 48
  const showDivider = (props.showDivider as boolean) ?? true
  const stats = (props.stats as Array<{ valor: string; label: string }>) || [
    { valor: '10+', label: 'anos de experiência' },
    { valor: '500+', label: 'clientes atendidos' },
    { valor: '98%', label: 'de satisfação' },
  ]

  const itemsHtml = stats.map((s, i) => {
    const hasDivider = showDivider && i < stats.length - 1
    return `<div style="display:flex;flex-direction:column;align-items:center;gap:clamp(4px,1vw,10px);padding:clamp(6px,1.5vw,8px) clamp(8px,3vw,32px);text-align:center${hasDivider ? ';border-right:1px solid rgba(255,255,255,0.18)' : ''}">
      <span style="font-size:clamp(28px,7vw,72px);font-weight:800;color:${escapeHtml(accent)};letter-spacing:-2px;line-height:1">${escapeHtml(s.valor)}</span>
      <span style="font-size:clamp(10px,2.2vw,15px);font-weight:600;color:${escapeHtml(labelColor)};text-transform:uppercase;letter-spacing:clamp(0.5px,0.3vw,1.5px);line-height:1.4">${escapeHtml(s.label)}</span>
    </div>`
  }).join('\n')

  return `<section style="width:100%;background:${escapeHtml(bg)};padding:${paddingY}px clamp(16px,5vw,40px)">
  <div style="max-width:960px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(140px,100%),1fr));gap:clamp(12px,3vw,0px)">${itemsHtml}</div>
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

  return `<section style="width:100%;background:${escapeHtml(bg)};padding:${paddingY}px clamp(16px,5vw,80px)">
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

  return `<section style="width:100%;background:${escapeHtml(bg)};padding:${paddingY}px clamp(16px,5vw,40px)">
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

  return `<section style="width:100%;background:${escapeHtml(bg)};padding:${paddingY}px clamp(24px,5vw,80px);position:relative;overflow:hidden">
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
    const css = CSS_RESET
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
  <style>${CSS_RESET}</style>${localUrlWarning}
</head>
<body>
${bodyContent}
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
