import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.48/deno-dom-wasm.ts'
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'

// ─── Types ───────────────────────────────────────────────────

type SectionType =
  | 'hero' | 'navbar' | 'features' | 'testimonials' | 'about'
  | 'faq' | 'logos' | 'gallery' | 'cta'
  | 'contact' | 'footer' | 'generic'

interface SectionLayout {
  type: 'stack' | 'grid' | 'two-column' | 'single'
  columns: number
  contentAlignment: 'left' | 'center' | 'right'
}

interface ContentInventory {
  headingCount: number
  headingLevels: number[]
  paragraphCount: number
  imageCount: number
  buttonCount: number
  listCount: number
  formCount: number
  hasIcon: boolean
  statNumbers: number
}

interface RepeatedItemStructure {
  hasImage: boolean
  hasHeading: boolean
  hasText: boolean
  hasButton: boolean
  hasIcon: boolean
  hasList: boolean
  estimatedHeight: 'compact' | 'medium' | 'tall'
}

interface RepeatedItemInfo {
  count: number
  itemStructure: RepeatedItemStructure
}

interface ColorPalette {
  primary: string | null
  accent: string | null
  background: string | null
  text: string | null
  gradientFrom: string | null
  gradientTo: string | null
  gradientType: 'linear' | 'radial' | null
  gradientDirection: string | null
}

interface ParsedSection {
  sectionType: SectionType
  childCount: number
  hasHeading: boolean
  headingText: string | null
  paragraphText: string | null
  headingTexts: string[]
  ctaTexts: string[]
  layout: SectionLayout
  backgroundTone: 'dark' | 'light' | 'accent' | 'unknown'
  actualBgColor: string | null
  contentInventory: ContentInventory
  repeatedItems: RepeatedItemInfo | null
  displayNameHint: string | null
  hasVideo: boolean
  videoType: 'youtube' | 'vimeo' | 'native' | null
  domTree?: DomLayoutNode
}

// ─── DOM Layout Tree Types ─────────────────────────────────────

interface ElementStyle {
  display?: string; flexDirection?: string; flexWrap?: string
  justifyContent?: string; alignItems?: string; gap?: string
  gridTemplateColumns?: string
  padding?: string; paddingTop?: string; paddingRight?: string
  paddingBottom?: string; paddingLeft?: string
  margin?: string; marginTop?: string; marginBottom?: string
  width?: string; height?: string; minHeight?: string; maxWidth?: string
  background?: string; backgroundColor?: string; backgroundImage?: string
  color?: string; fontSize?: string; fontWeight?: string
  lineHeight?: string; textAlign?: string; borderRadius?: string
  border?: string; boxShadow?: string; position?: string
  visibility?: string; opacity?: string; objectFit?: string
}

interface DomLayoutNode {
  id: string; tag: string; style: ElementStyle
  children: DomLayoutNode[]
  text?: string; src?: string; alt?: string; href?: string; depth: number
}

type CssRuleMap = Map<string, Record<string, string>>

interface FetchHtmlResponse {
  success: boolean
  title: string | null
  sections: ParsedSection[]
  colorPalette: ColorPalette | null
  fontFamily: string | null
  error?: string
}

// ─── Security ────────────────────────────────────────────────

const PRIVATE_IP_PATTERNS = [
  /^127\./, /^10\./, /^192\.168\./, /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./, /^0\./, /^::1$/, /^localhost$/i,
]

function isPrivateUrl(urlStr: string): boolean {
  try {
    const hostname = new URL(urlStr).hostname
    return PRIVATE_IP_PATTERNS.some((p) => p.test(hostname))
  } catch {
    return true
  }
}

function validateUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) return 'URL deve usar http:// ou https://'
    if (isPrivateUrl(url)) return 'URL de rede privada nao permitida'
    return null
  } catch {
    return 'URL invalida'
  }
}

// ─── CSS Parsing & DOM Layout Tree ───────────────────────────

/** Kebab-case → camelCase: 'font-size' → 'fontSize' */
function toCamelCase(s: string): string {
  return s.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
}

/** Parseia atributo style inline → Record<prop, value> */
function parseInlineStyleStr(styleAttr: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const part of styleAttr.split(';')) {
    const idx = part.indexOf(':')
    if (idx === -1) continue
    const prop = toCamelCase(part.slice(0, idx).trim())
    const val = part.slice(idx + 1).trim()
    if (prop && val) result[prop] = val
  }
  return result
}

/**
 * Parseia conteúdo de <style> tags em um mapa className → declarações.
 * Suporta apenas seletores de classe simples (.foo) sem pseudo-classes.
 */
function parseCssToRuleMap(css: string): CssRuleMap {
  const map: CssRuleMap = new Map()
  css = css.replace(/\/\*[\s\S]*?\*\//g, '') // remove comentários
  const ruleRegex = /([^{}]+)\{([^{}]*)\}/g
  let m: RegExpExecArray | null
  while ((m = ruleRegex.exec(css)) !== null) {
    const selectors = m[1].trim().split(',')
    const declBlock = m[2].trim()
    const styles: Record<string, string> = {}
    const declRegex = /([\w-]+)\s*:\s*([^;!]+)(?:!important)?;?/g
    let d: RegExpExecArray | null
    while ((d = declRegex.exec(declBlock)) !== null) {
      styles[toCamelCase(d[1].trim())] = d[2].trim()
    }
    for (const sel of selectors) {
      const s = sel.trim()
      // Apenas seletores de classe simples: .foo, .foo-bar (sem pseudo, espaços, atributos)
      if (s.startsWith('.') && !s.includes(':') && !s.includes(' ') && !s.includes('>') && !s.includes('[')) {
        const cls = s.slice(1).split('.')[0]
        if (cls) {
          const existing = map.get(cls) ?? {}
          map.set(cls, { ...existing, ...styles })
        }
      }
    }
  }
  return map
}

/** Resolve estilos de um elemento: classes CSS + inline style */
function resolveElStyle(el: any, ruleMap: CssRuleMap): ElementStyle {
  const result: Record<string, string> = {}
  const classes = (el.getAttribute?.('class') ?? '').split(/\s+/)
  for (const cls of classes) {
    if (!cls) continue
    const s = ruleMap.get(cls)
    if (s) Object.assign(result, s)
  }
  const inline = el.getAttribute?.('style') ?? ''
  if (inline) Object.assign(result, parseInlineStyleStr(inline))
  return result as ElementStyle
}

/** Verifica se um elemento é apenas um wrapper visual sem estilo próprio */
function isDomWrapperOnly(style: ElementStyle): boolean {
  return !style.background && !style.backgroundColor && !style.backgroundImage
    && !style.border && !style.padding && !style.paddingTop && !style.paddingLeft
    && !style.boxShadow && !style.minHeight && !style.borderRadius
}

const DOM_SKIP_TAGS = new Set([
  'script', 'style', 'noscript', 'meta', 'link', 'head', 'title',
  'path', 'defs', 'clippath', 'symbol', 'use', 'lineargradient', 'radialgradient',
])
const DOM_LEAF_TAGS = new Set([
  'p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'li', 'a', 'button', 'label', 'strong', 'em', 'b', 'i', 'small', 'td', 'th', 'dt', 'dd',
])
const DOM_MAX_DEPTH = 6
const DOM_MAX_CHILDREN = 10
const DOM_MAX_NODES = 120

/**
 * Constrói recursivamente uma árvore DomLayoutNode a partir de um elemento DOM.
 * Limites: profundidade 6, 10 filhos por nó, 120 nós totais por seção.
 */
function buildDomLayoutNode(
  el: any,
  ruleMap: CssRuleMap,
  depth: number,
  counter: { n: number },
): DomLayoutNode | null {
  if (depth > DOM_MAX_DEPTH || counter.n > DOM_MAX_NODES) return null

  const tag = (el.tagName?.toLowerCase() ?? 'div') as string
  if (DOM_SKIP_TAGS.has(tag)) return null

  const style = resolveElStyle(el, ruleMap)
  if (style.visibility === 'hidden' || style.display === 'none' || style.opacity === '0') return null

  counter.n++
  const id = `dn-${counter.n}`

  // Imagem
  if (tag === 'img') {
    const src = el.getAttribute?.('src') ?? ''
    const alt = el.getAttribute?.('alt') ?? ''
    return { id, tag, style, children: [], src, alt, depth }
  }

  // SVG inteiro → representa como imagem placeholder
  if (tag === 'svg') {
    return { id, tag, style, children: [], src: '', alt: 'icon', depth }
  }

  // Elemento folha sem filhos de elemento
  if (DOM_LEAF_TAGS.has(tag) && (el.children?.length ?? 0) === 0) {
    const text = el.textContent?.trim()?.substring(0, 200) ?? ''
    const href = tag === 'a' ? (el.getAttribute?.('href') ?? undefined) : undefined
    return { id, tag, style, children: [], text: text || undefined, href, depth }
  }

  // Container: processar filhos recursivamente
  const children: DomLayoutNode[] = []
  const childEls = Array.from(el.children ?? []).slice(0, DOM_MAX_CHILDREN)

  for (const child of childEls) {
    const childNode = buildDomLayoutNode(child as any, ruleMap, depth + 1, counter)
    if (childNode) children.push(childNode)
  }

  // Sem filhos → tentar extrair texto do container
  if (children.length === 0) {
    const text = el.textContent?.trim()?.substring(0, 200) ?? ''
    if (!text) return null
    return { id, tag, style, children: [], text, depth }
  }

  // Collapsar wrapper sem estilo visual com único filho
  if (children.length === 1 && isDomWrapperOnly(style)) {
    return { ...children[0], depth }
  }

  const href = tag === 'a' ? (el.getAttribute?.('href') ?? undefined) : undefined
  return { id, tag, style, children, href, depth }
}

// ─── Color Helpers ────────────────────────────────────────────

function classifyColor(color: string): 'dark' | 'light' | 'accent' {
  let r: number, g: number, b: number

  if (color.startsWith('#')) {
    const hex = color.replace('#', '')
    const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex
    r = parseInt(full.substring(0, 2), 16)
    g = parseInt(full.substring(2, 4), 16)
    b = parseInt(full.substring(4, 6), 16)
  } else {
    const match = color.match(/(\d+)/g)
    if (!match || match.length < 3) return 'light'
    r = parseInt(match[0])
    g = parseInt(match[1])
    b = parseInt(match[2])
  }

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const saturation = max === 0 ? 0 : (max - min) / max

  if (saturation > 0.3 && luminance > 0.15 && luminance < 0.85) return 'accent'
  return luminance < 0.45 ? 'dark' : 'light'
}

/** Normaliza rgb(r,g,b) → #rrggbb para uniformidade */
function normalizeColor(raw: string): string {
  raw = raw.trim()
  if (raw.startsWith('#')) return raw.toLowerCase()
  const m = raw.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (m) {
    const hex = (n: number) => n.toString(16).padStart(2, '0')
    return `#${hex(+m[1])}${hex(+m[2])}${hex(+m[3])}`
  }
  return raw
}

// ─── Tailwind Color Map ───────────────────────────────────────

const TW_COLORS: Record<string, string> = {
  // Slate
  'slate-50': '#f8fafc', 'slate-100': '#f1f5f9', 'slate-200': '#e2e8f0',
  'slate-300': '#cbd5e1', 'slate-400': '#94a3b8', 'slate-500': '#64748b',
  'slate-600': '#475569', 'slate-700': '#334155', 'slate-800': '#1e293b',
  'slate-900': '#0f172a', 'slate-950': '#020617',
  // Gray
  'gray-50': '#f9fafb', 'gray-100': '#f3f4f6', 'gray-200': '#e5e7eb',
  'gray-300': '#d1d5db', 'gray-400': '#9ca3af', 'gray-500': '#6b7280',
  'gray-600': '#4b5563', 'gray-700': '#374151', 'gray-800': '#1f2937',
  'gray-900': '#111827', 'gray-950': '#030712',
  // Zinc
  'zinc-50': '#fafafa', 'zinc-100': '#f4f4f5', 'zinc-200': '#e4e4e7',
  'zinc-300': '#d4d4d8', 'zinc-400': '#a1a1aa', 'zinc-500': '#71717a',
  'zinc-600': '#52525b', 'zinc-700': '#3f3f46', 'zinc-800': '#27272a',
  'zinc-900': '#18181b', 'zinc-950': '#09090b',
  // Neutral
  'neutral-50': '#fafafa', 'neutral-100': '#f5f5f5', 'neutral-200': '#e5e5e5',
  'neutral-300': '#d4d4d4', 'neutral-400': '#a3a3a3', 'neutral-500': '#737373',
  'neutral-600': '#525252', 'neutral-700': '#404040', 'neutral-800': '#262626',
  'neutral-900': '#171717', 'neutral-950': '#0a0a0a',
  // Stone
  'stone-50': '#fafaf9', 'stone-100': '#f5f5f4', 'stone-200': '#e7e5e4',
  'stone-300': '#d6d3d1', 'stone-400': '#a8a29e', 'stone-500': '#78716c',
  'stone-600': '#57534e', 'stone-700': '#44403c', 'stone-800': '#292524',
  'stone-900': '#1c1917', 'stone-950': '#0c0a09',
  // Red
  'red-50': '#fef2f2', 'red-100': '#fee2e2', 'red-200': '#fecaca',
  'red-300': '#fca5a5', 'red-400': '#f87171', 'red-500': '#ef4444',
  'red-600': '#dc2626', 'red-700': '#b91c1c', 'red-800': '#991b1b',
  'red-900': '#7f1d1d', 'red-950': '#450a0a',
  // Orange
  'orange-50': '#fff7ed', 'orange-100': '#ffedd5', 'orange-200': '#fed7aa',
  'orange-300': '#fdba74', 'orange-400': '#fb923c', 'orange-500': '#f97316',
  'orange-600': '#ea580c', 'orange-700': '#c2410c', 'orange-800': '#9a3412',
  'orange-900': '#7c2d12', 'orange-950': '#431407',
  // Amber
  'amber-50': '#fffbeb', 'amber-100': '#fef3c7', 'amber-200': '#fde68a',
  'amber-300': '#fcd34d', 'amber-400': '#fbbf24', 'amber-500': '#f59e0b',
  'amber-600': '#d97706', 'amber-700': '#b45309', 'amber-800': '#92400e',
  'amber-900': '#78350f', 'amber-950': '#451a03',
  // Yellow
  'yellow-50': '#fefce8', 'yellow-100': '#fef9c3', 'yellow-200': '#fef08a',
  'yellow-300': '#fde047', 'yellow-400': '#facc15', 'yellow-500': '#eab308',
  'yellow-600': '#ca8a04', 'yellow-700': '#a16207', 'yellow-800': '#854d0e',
  'yellow-900': '#713f12', 'yellow-950': '#422006',
  // Lime
  'lime-50': '#f7fee7', 'lime-300': '#bef264', 'lime-400': '#a3e635',
  'lime-500': '#84cc16', 'lime-600': '#65a30d', 'lime-700': '#4d7c0f',
  // Green
  'green-50': '#f0fdf4', 'green-100': '#dcfce7', 'green-200': '#bbf7d0',
  'green-300': '#86efac', 'green-400': '#4ade80', 'green-500': '#22c55e',
  'green-600': '#16a34a', 'green-700': '#15803d', 'green-800': '#166534',
  'green-900': '#14532d', 'green-950': '#052e16',
  // Emerald
  'emerald-50': '#ecfdf5', 'emerald-400': '#34d399', 'emerald-500': '#10b981',
  'emerald-600': '#059669', 'emerald-700': '#047857', 'emerald-900': '#064e3b',
  // Teal
  'teal-50': '#f0fdfa', 'teal-400': '#2dd4bf', 'teal-500': '#14b8a6',
  'teal-600': '#0d9488', 'teal-700': '#0f766e', 'teal-900': '#134e4a',
  // Cyan
  'cyan-50': '#ecfeff', 'cyan-400': '#22d3ee', 'cyan-500': '#06b6d4',
  'cyan-600': '#0891b2', 'cyan-700': '#0e7490', 'cyan-900': '#164e63',
  // Sky
  'sky-50': '#f0f9ff', 'sky-400': '#38bdf8', 'sky-500': '#0ea5e9',
  'sky-600': '#0284c7', 'sky-700': '#0369a1', 'sky-900': '#0c4a6e',
  // Blue
  'blue-50': '#eff6ff', 'blue-100': '#dbeafe', 'blue-200': '#bfdbfe',
  'blue-300': '#93c5fd', 'blue-400': '#60a5fa', 'blue-500': '#3b82f6',
  'blue-600': '#2563eb', 'blue-700': '#1d4ed8', 'blue-800': '#1e40af',
  'blue-900': '#1e3a8a', 'blue-950': '#172554',
  // Indigo
  'indigo-50': '#eef2ff', 'indigo-400': '#818cf8', 'indigo-500': '#6366f1',
  'indigo-600': '#4f46e5', 'indigo-700': '#4338ca', 'indigo-900': '#312e81',
  // Violet
  'violet-50': '#f5f3ff', 'violet-400': '#a78bfa', 'violet-500': '#8b5cf6',
  'violet-600': '#7c3aed', 'violet-700': '#6d28d9', 'violet-900': '#4c1d95',
  // Purple
  'purple-50': '#faf5ff', 'purple-400': '#c084fc', 'purple-500': '#a855f7',
  'purple-600': '#9333ea', 'purple-700': '#7e22ce', 'purple-900': '#581c87',
  // Fuchsia
  'fuchsia-50': '#fdf4ff', 'fuchsia-400': '#e879f9', 'fuchsia-500': '#d946ef',
  'fuchsia-600': '#c026d3', 'fuchsia-700': '#a21caf',
  // Pink
  'pink-50': '#fdf2f8', 'pink-400': '#f472b6', 'pink-500': '#ec4899',
  'pink-600': '#db2777', 'pink-700': '#be185d', 'pink-900': '#831843',
  // Rose
  'rose-50': '#fff1f2', 'rose-400': '#fb7185', 'rose-500': '#f43f5e',
  'rose-600': '#e11d48', 'rose-700': '#be123c', 'rose-900': '#881337',
  // Base
  'white': '#ffffff', 'black': '#000000',
}

/**
 * Extrai cor hex de uma string de classes CSS Tailwind.
 * Suporta: bg-orange-500, bg-[#abc], bg-[rgb(r,g,b)], bg-black, bg-white
 */
function extractTailwindBg(classes: string): string | null {
  if (!classes) return null

  // JIT arbitrary: bg-[#abc123] ou bg-[#abc]
  const jitHex = /\bbg-\[#([0-9a-fA-F]{3,8})\]/.exec(classes)
  if (jitHex) return `#${jitHex[1].toLowerCase()}`

  // JIT rgb: bg-[rgb(r,g,b)] ou bg-[rgba(r,g,b,a)]
  const jitRgb = /\bbg-\[(rgba?\([^)\]]+\))\]/.exec(classes)
  if (jitRgb) return normalizeColor(jitRgb[1])

  // Named Tailwind class: bg-orange-500, bg-slate-900, bg-white, bg-black
  const named = /\bbg-((?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}|white|black)\b/.exec(classes)
  if (named) return TW_COLORS[named[1]] ?? null

  return null
}

/**
 * Extrai cor hex de classes CSS Tailwind de texto.
 * Suporta: text-white, text-orange-500, text-[#abc]
 */
function extractTailwindText(classes: string): string | null {
  if (!classes) return null

  const jitHex = /\btext-\[#([0-9a-fA-F]{3,8})\]/.exec(classes)
  if (jitHex) return `#${jitHex[1].toLowerCase()}`

  const named = /\btext-((?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}|white|black)\b/.exec(classes)
  if (named) return TW_COLORS[named[1]] ?? null

  return null
}

// Extrai até 2 cores hex/rgb de uma string de gradiente
function extractGradientColors(gradientArgs: string): string[] {
  const matches = gradientArgs.match(/#[0-9a-fA-F]{3,8}|rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+[^)]*\)/g)
  if (!matches || matches.length < 2) return []
  return [normalizeColor(matches[0]), normalizeColor(matches[matches.length - 1])]
}

// ─── Color Palette Extraction ────────────────────────────────

/** Extrai gradiente (linear ou radial) de um inline style e popula a paleta */
function applyGradientFromStyle(style: string, palette: ColorPalette): void {
  const lowerStyle = style.toLowerCase()

  if (!palette.gradientFrom) {
    const linearMatch = lowerStyle.match(/linear-gradient\(\s*([^)]+)\)/)
    if (linearMatch) {
      const colors = extractGradientColors(linearMatch[1])
      if (colors.length >= 2) {
        palette.gradientFrom = colors[0]
        palette.gradientTo = colors[1]
        palette.gradientType = 'linear'
        const dirMatch = linearMatch[1].match(/^([\d.]+deg|to\s+\w+(?:\s+\w+)?)/)
        palette.gradientDirection = dirMatch ? dirMatch[1].trim() : '135deg'
        if (!palette.primary) palette.primary = colors[0]
      }
    }
  }

  const radialMatch = lowerStyle.match(/radial-gradient\(\s*([^)]+)\)/)
  if (radialMatch) {
    const colors = extractGradientColors(radialMatch[1])
    if (colors.length >= 2) {
      palette.gradientFrom = colors[0]
      palette.gradientTo = colors[1]
      palette.gradientType = 'radial'
      const posMatch = radialMatch[1].match(/(circle|ellipse)(?:\s+at\s+[\w\s]+)?/)
      palette.gradientDirection = posMatch ? posMatch[0].trim() : 'circle at bottom right'
      if (!palette.primary) palette.primary = colors[0]
    }
  }
}

/** Escaneia um elemento e seus filhos diretos em busca de gradientes inline */
function scanGradientInElement(el: any, palette: ColorPalette): void {
  if (!el) return
  const style = el.getAttribute?.('style') ?? ''
  if (style) applyGradientFromStyle(style, palette)

  // Verificar também filhos diretos (ex: div de background absoluto dentro do hero)
  for (const child of Array.from(el.children ?? []).slice(0, 5)) {
    const childStyle = (child as any).getAttribute?.('style') ?? ''
    if (childStyle && (childStyle.includes('gradient') || childStyle.includes('background'))) {
      applyGradientFromStyle(childStyle, palette)
      if (palette.gradientFrom) break
    }
  }
}

function extractColorPalette(doc: any): ColorPalette {
  const palette: ColorPalette = {
    primary: null,
    accent: null,
    background: null,
    text: null,
    gradientFrom: null,
    gradientTo: null,
    gradientType: null,
    gradientDirection: null,
  }

  // 1. meta theme-color (fast path para PWAs)
  const themeColor = doc.querySelector('meta[name="theme-color"]')?.getAttribute?.('content')
  if (themeColor && themeColor.startsWith('#')) {
    const tone = classifyColor(themeColor)
    if (tone === 'accent') palette.accent = themeColor
    else if (tone === 'dark') palette.primary = themeColor
  }

  // 2. Parse <style> tags para CSS variables e body rules
  const styleTags = Array.from(doc.querySelectorAll?.('style') ?? [])
  for (const styleEl of styleTags) {
    const css = (styleEl as any).textContent ?? ''

    // CSS variables genéricas
    const varPatterns: Array<[RegExp, keyof ColorPalette]> = [
      [/--(?:primary|brand|main|cor-principal|color-primary)\s*:\s*(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\))/i, 'primary'],
      [/--(?:accent|secondary|highlight|destaque|color-accent|cor-secundaria)\s*:\s*(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\))/i, 'accent'],
      [/--(?:background|bg|cor-fundo|color-bg)\s*:\s*(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\))/i, 'background'],
      [/--(?:text|color-text|cor-texto|foreground)\s*:\s*(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\))/i, 'text'],
    ]
    for (const [regex, key] of varPatterns) {
      if (!palette[key]) {
        const m = css.match(regex)
        if (m) palette[key] = normalizeColor(m[1])
      }
    }

    // Elementor CSS variables inline
    if (!palette.primary) {
      const em = css.match(/--e-global-color-primary\s*:\s*(#[0-9a-fA-F]{3,8})/)
      if (em) palette.primary = normalizeColor(em[1])
    }
    if (!palette.accent) {
      const es = css.match(/--e-global-color-secondary\s*:\s*(#[0-9a-fA-F]{3,8})/)
      if (es) {
        const c = normalizeColor(es[1])
        if (classifyColor(c) === 'accent') palette.accent = c
      }
      if (!palette.accent) {
        const ea = css.match(/--e-global-color-accent\s*:\s*(#[0-9a-fA-F]{3,8})/)
        if (ea) {
          const c = normalizeColor(ea[1])
          if (classifyColor(c) === 'accent') palette.accent = c
        }
      }
    }

    // body/html/wrapper background — qualquer seletor de nível raiz
    if (!palette.background) {
      const m = css.match(/(?:html|body)\s*\{[^}]*background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\))/i)
      if (m) palette.background = normalizeColor(m[1])
    }

    // Fallback: #Wrapper, #Content (BeTheme, Betheme, etc.)
    if (!palette.primary) {
      const m = css.match(/(?:#Wrapper|#Content|#Header|\.site-header)\s*\{[^}]*background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\))/i)
      if (m) {
        const c = normalizeColor(m[1])
        if (isDarkColor(c)) palette.primary = c
      }
    }

    if (!palette.text) {
      const m = css.match(/(?:html|body)\s*\{[^}]*(?:^|\s)color\s*:\s*(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\))/im)
      if (m) palette.text = normalizeColor(m[1])
    }

    // Gradientes em CSS inline (ex: :root, body)
    if (!palette.gradientFrom) {
      applyGradientFromStyle(css, palette)
    }
  }

  // 3. Extrair cores do header/hero — inline style E classes Tailwind
  //    Busca em múltiplos seletores para encontrar o elemento mais relevante
  const heroSelectors = [
    'header',
    '[class*="hero"]', '[id*="hero"]',
    '[class*="banner"]', '[id*="banner"]',
    '[class*="jumbotron"]',
    'main > section:first-child',
    'main > div:first-child',
    '#root > div:first-child',
    '#__next > div:first-child',
    'body > div:first-child',
  ]

  for (const sel of heroSelectors) {
    const el = doc.querySelector?.(sel)
    if (!el) continue

    const cls = el.getAttribute?.('class') ?? ''
    const style = el.getAttribute?.('style') ?? ''

    // Gradiente inline
    if (!palette.gradientFrom) scanGradientInElement(el, palette)

    // Background inline
    if (!palette.primary) {
      const bgMatch = style.match(/background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\))/)
      if (bgMatch) palette.primary = normalizeColor(bgMatch[1])
    }

    // Classes Tailwind
    if (!palette.primary) {
      const twColor = extractTailwindBg(cls)
      if (twColor && twColor !== '#ffffff' && twColor !== 'transparent') {
        palette.primary = twColor
      }
    }

    if (palette.primary) break
  }

  // 4. Cor primária via nav/header se ainda não encontrada
  if (!palette.primary) {
    const navEl = doc.querySelector?.('nav, header')
    if (navEl) {
      const cls = navEl.getAttribute?.('class') ?? ''
      const style = navEl.getAttribute?.('style') ?? ''

      const twColor = extractTailwindBg(cls)
      if (twColor && twColor !== '#ffffff') palette.primary = twColor

      if (!palette.primary) {
        const bgMatch = style.match(/background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\))/)
        if (bgMatch) palette.primary = normalizeColor(bgMatch[1])
      }

      if (!palette.primary) {
        if (/bg-(slate|gray|zinc|neutral|stone)-(700|800|900|950)|bg-black/.test(cls)) {
          palette.primary = '#0f172a'
        }
      }
    }
  }

  // 5. Extrair accent de botões CTA — inline style E Tailwind classes
  const ctaSelectors = [
    'button',
    'a[class*="btn"]',
    'a[class*="button"]',
    'a[class*="cta"]',
    '[class*="btn-primary"]',
    '[class*="button-primary"]',
    '[class*="cta-button"]',
    'a[href*="contato"]',
    'a[href*="contact"]',
  ]
  const allButtons = Array.from(doc.querySelectorAll?.(ctaSelectors.join(', ')) ?? []).slice(0, 25)

  for (const btn of allButtons) {
    if (palette.accent) break
    const btnStyle = ((btn as any).getAttribute?.('style') ?? '')
    const btnClass = ((btn as any).getAttribute?.('class') ?? '')

    // Inline background
    const bgMatch = btnStyle.match(/background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\))/)
    if (bgMatch) {
      const c = normalizeColor(bgMatch[1])
      if (classifyColor(c) === 'accent') { palette.accent = c; continue }
    }

    // Tailwind class
    const twColor = extractTailwindBg(btnClass)
    if (twColor && classifyColor(twColor) === 'accent') {
      palette.accent = twColor
      continue
    }
  }

  // 6. Fallback accent via qualquer elemento colorido no hero
  if (!palette.accent) {
    const heroEl = doc.querySelector?.('header, [class*="hero"], [id*="hero"]')
    if (heroEl) {
      const colorfulEls = Array.from(heroEl.querySelectorAll?.('*') ?? []).slice(0, 50)
      for (const el of colorfulEls) {
        const cls = (el as any).getAttribute?.('class') ?? ''
        const twColor = extractTailwindBg(cls)
        if (twColor && classifyColor(twColor) === 'accent') {
          palette.accent = twColor
          break
        }
      }
    }
  }

  return palette
}

// ─── Font Family Extraction ───────────────────────────────────

function extractFontFamily(doc: any): string | null {
  // Google Fonts / Bunny Fonts via <link>
  const links = Array.from(doc.querySelectorAll?.('link[rel="stylesheet"]') ?? [])
  for (const link of links) {
    const href = ((link as any).getAttribute?.('href') ?? '')
    if (href.includes('fonts.googleapis.com') || href.includes('fonts.bunny.net')) {
      const m = href.match(/family=([^&:]+)/)
      if (m) return decodeURIComponent(m[1]).replace(/\+/g, ' ').split('|')[0].split(':')[0].trim()
    }
  }

  // @import in <style> tags
  const styles = Array.from(doc.querySelectorAll?.('style') ?? [])
  for (const style of styles) {
    const css = (style as any).textContent ?? ''

    // @import url(...)
    const importMatch = css.match(/@import\s+url\(['"]?https?:\/\/fonts\.(?:googleapis|bunny)\.com\/css[^'"]+family=([^&:'"]+)/)
    if (importMatch) return decodeURIComponent(importMatch[1]).replace(/\+/g, ' ').split('|')[0].split(':')[0].trim()

    // font-family in body or :root
    const fontMatch = css.match(/(?:body|:root)\s*\{[^}]*font-family\s*:\s*['"]?([A-Za-z][^,;'"]+)/)
    if (fontMatch) {
      const family = fontMatch[1].trim().replace(/^['"]|['"]$/g, '')
      // Exclude generic families
      if (!['serif', 'sans-serif', 'monospace', 'inherit', 'initial'].includes(family.toLowerCase())) {
        return family
      }
    }
  }

  return null
}

// ─── Section Type Detection ──────────────────────────────────

const HERO_CLASSES        = /hero|banner|jumbotron|masthead|slider|carousel|splash/i
const FEATURES_CLASSES    = /features?|services?|benefits?|capabilities|solutions|servicos?/i
const TESTIMONIAL_CLASSES = /testimonial|depoimento|review|feedback|quote|avalia/i
const ABOUT_CLASSES       = /about|sobre|quem.?somos|historia|who.?we|company/i
const FAQ_CLASSES         = /faq|perguntas?|accordion|duvida|question|ask/i
const LOGOS_CLASSES       = /logos?|partners?|parceiros?|clients?|clientes?|brands?|marcas?|trust|confian/i
const GALLERY_CLASSES     = /gallery|galeria|portfolio|showcase|projetos?|cases?/i
const CTA_CLASSES         = /cta|call.?to.?action|newsletter|subscribe|agendar/i
const CONTACT_CLASSES     = /contact|contato|formulario|form.?section|fale.?conosco/i
const FOOTER_CLASSES      = /footer|bottom|colophon/i
const STATS_CLASSES       = /stats?|numbers?|numeros?|metricas?|counters?|achievements?/i
const NAV_CLASSES         = /navbar|nav-bar|top-bar|site-header|main-menu|primary-nav|menu-principal/i

function detectSectionType(
  el: any,
  index: number,
  total: number,
): SectionType {
  const tag = el.tagName?.toLowerCase() ?? ''
  const className = (el.getAttribute?.('class') ?? '').toLowerCase()
  const id = (el.getAttribute?.('id') ?? '').toLowerCase()
  const combined = `${className} ${id}`

  // 1. Pure nav tag → always navbar
  if (tag === 'nav') return 'navbar'

  // 2. Footer tag → always footer
  if (tag === 'footer') return 'footer'

  // 3. Header tag: navbar if navigation-only, hero if has hero content
  if (tag === 'header') {
    const hasH1 = !!el.querySelector?.('h1')
    const navLinks = (el.querySelectorAll?.('a, li') ?? []).length
    const paragraphs = (el.querySelectorAll?.('p') ?? []).length
    // If header has no H1 and is link-heavy → it's a navbar
    if (!hasH1 && navLinks >= 3 && paragraphs <= 1) return 'navbar'
    return 'hero'
  }

  // 4. Class/ID with explicit navbar patterns
  if (NAV_CLASSES.test(combined)) return 'navbar'

  // 5. Specific semantic types — most specific first
  if (FAQ_CLASSES.test(combined)) return 'faq'
  if (TESTIMONIAL_CLASSES.test(combined)) return 'testimonials'
  if (ABOUT_CLASSES.test(combined)) return 'about'
  if (LOGOS_CLASSES.test(combined)) return 'logos'
  if (GALLERY_CLASSES.test(combined)) return 'gallery'
  if (CONTACT_CLASSES.test(combined)) return 'contact'
  if (HERO_CLASSES.test(combined)) return 'hero'
  if (FEATURES_CLASSES.test(combined)) return 'features'
  if (CTA_CLASSES.test(combined)) return 'cta'
  if (FOOTER_CLASSES.test(combined)) return 'footer'
  if (STATS_CLASSES.test(combined)) return 'about'

  // 6. Structural heuristics
  const contentInventory = extractContentInventory(el)
  const repeatedItems = detectRepeatedItems(el)

  // FAQ: accordion pattern
  const detailsEls = el.querySelectorAll?.('details') ?? []
  if (detailsEls.length >= 3) return 'faq'
  if (repeatedItems && repeatedItems.count >= 5 && repeatedItems.itemStructure.hasHeading && !repeatedItems.itemStructure.hasImage) {
    const text = (el.textContent ?? '').toLowerCase()
    if (text.includes('?') || text.includes('pergunta') || text.includes('duvida')) return 'faq'
  }

  // Contact: has form
  if (contentInventory.formCount > 0) return 'contact'

  // Testimonials: cards with quoted text
  if (repeatedItems && repeatedItems.count >= 2) {
    const text = (el.textContent ?? '').substring(0, 2000)
    const quoteCount = (text.match(/[""«»]/g) ?? []).length
    if (quoteCount >= 4) return 'testimonials'
  }

  // About/Stats: two-column with stat numbers
  if (contentInventory.statNumbers >= 3) return 'about'

  // Logos: many small images, no headings in children
  if (contentInventory.imageCount >= 4 && contentInventory.headingCount <= 1) {
    if (!repeatedItems || !repeatedItems.itemStructure.hasHeading) return 'logos'
  }

  // First section with H1 → hero
  if (el.querySelector?.('h1') && index === 0) return 'hero'

  // Features: grid of repeated cards with headings
  if (repeatedItems && repeatedItems.count >= 3 && repeatedItems.itemStructure.hasHeading) {
    if (repeatedItems.itemStructure.hasImage) return 'gallery'
    return 'features'
  }

  // CTA: small section with button, few elements
  if (contentInventory.buttonCount > 0 && contentInventory.headingCount <= 2 && contentInventory.paragraphCount <= 2) {
    const children = Array.from(el.children ?? [])
    if (children.length <= 5) return 'cta'
  }

  // Copyright in last section → footer
  const text = (el.textContent ?? '').toLowerCase()
  if (index === total - 1 && (text.includes('©') || text.includes('direitos reservados') || text.includes('all rights'))) {
    return 'footer'
  }

  // Position fallbacks
  if (index === 0) return 'hero'
  if (index === total - 1) return 'footer'

  return 'generic'
}

// ─── Layout Detection ────────────────────────────────────────

function detectLayout(el: any): SectionLayout {
  const style = (el.getAttribute?.('style') ?? '').toLowerCase()
  const className = (el.getAttribute?.('class') ?? '').toLowerCase()

  const gridColMatch = className.match(/grid-cols-(\d+)/)
  if (gridColMatch) {
    return { type: 'grid', columns: parseInt(gridColMatch[1]) || 3, contentAlignment: 'center' }
  }

  const bsColMatch = className.match(/col-(?:md|lg|xl)-(\d+)/)
  if (bsColMatch) {
    const colSize = parseInt(bsColMatch[1])
    const cols = colSize > 0 ? Math.round(12 / colSize) : 3
    return { type: 'grid', columns: cols, contentAlignment: 'center' }
  }

  if (style.includes('grid')) {
    const gridMatch = style.match(/grid-template-columns\s*:\s*repeat\s*\(\s*(\d+)/)
    const cols = gridMatch ? parseInt(gridMatch[1]) : 3
    return { type: 'grid', columns: Math.min(cols, 6), contentAlignment: 'center' }
  }

  if (style.includes('flex-direction') && style.includes('row')) {
    return { type: 'two-column', columns: 2, contentAlignment: 'left' }
  }

  const children = Array.from(el.children ?? []).filter(
    (c: any) => c.tagName && !['br', 'hr', 'script', 'style'].includes(c.tagName.toLowerCase()),
  )

  if (children.length === 2) {
    const c1 = children[0] as any
    const c2 = children[1] as any
    const bothDivs =
      ['div', 'section', 'article'].includes(c1.tagName?.toLowerCase()) &&
      ['div', 'section', 'article'].includes(c2.tagName?.toLowerCase())
    if (bothDivs) {
      return { type: 'two-column', columns: 2, contentAlignment: 'left' }
    }
  }

  if (children.length >= 3) {
    const childTags = children.map((c: any) => c.tagName?.toLowerCase())
    const allSame = childTags.every((t: string) => t === childTags[0])
    if (allSame && ['div', 'article', 'li', 'a'].includes(childTags[0])) {
      const cols = children.length <= 4 ? children.length : children.length <= 6 ? 3 : 4
      return { type: 'grid', columns: cols, contentAlignment: 'center' }
    }
  }

  if (/flex.*row|d-flex|row/.test(className)) {
    const cols = Math.min(children.length, 4) || 2
    return { type: 'grid', columns: cols, contentAlignment: 'center' }
  }

  const alignment =
    /text-center|text-align\s*:\s*center|mx-auto/.test(`${className} ${style}`)
      ? 'center'
      : /text-right|text-align\s*:\s*right/.test(`${className} ${style}`)
        ? 'right'
        : 'left'

  return { type: 'stack', columns: 1, contentAlignment: alignment as SectionLayout['contentAlignment'] }
}

// ─── Background Tone Detection ───────────────────────────────

function detectBackgroundTone(el: any): 'dark' | 'light' | 'accent' | 'unknown' {
  const style = (el.getAttribute?.('style') ?? '').toLowerCase()
  const className = (el.getAttribute?.('class') ?? '')

  // 1. Inline style — mais confiável
  const bgMatch = style.match(/background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))/)
  if (bgMatch) return classifyColor(bgMatch[1])

  // Gradiente inline
  const gradMatch = style.match(/(?:linear|radial)-gradient\([^)]+\)/)
  if (gradMatch) {
    const colors = extractGradientColors(gradMatch[0])
    if (colors.length > 0) return classifyColor(colors[0])
  }

  // 2. Tailwind classes — traduzir para hex e classificar
  const twColor = extractTailwindBg(className)
  if (twColor && twColor !== 'transparent') return classifyColor(twColor)

  // 3. Padrões de nome de classe
  const lowerClass = className.toLowerCase()
  if (/bg-(slate|gray|zinc|neutral|stone)-(700|800|900|950)|bg-black/.test(lowerClass)) return 'dark'
  if (/bg-(slate|gray|zinc|neutral|stone)-(50|100|200)|bg-white/.test(lowerClass)) return 'light'
  if (/bg-(blue|green|red|yellow|purple|pink|indigo|teal|orange|amber|cyan|violet|fuchsia|rose|lime|emerald)-(400|500|600|700)/.test(lowerClass)) return 'accent'

  if (/dark|black|negro|escuro/.test(lowerClass)) return 'dark'
  if (/light|white|branco|claro/.test(lowerClass)) return 'light'

  return 'unknown'
}

/** Extrai a cor de fundo real (hex) de um elemento, ou null */
function extractActualBgColor(el: any): string | null {
  // Inline style tem prioridade
  const style = (el.getAttribute?.('style') ?? '')
  const bgMatch = style.match(/background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))/)
  if (bgMatch) return normalizeColor(bgMatch[1])

  // Classes Tailwind como fallback
  const cls = el.getAttribute?.('class') ?? ''
  const twColor = extractTailwindBg(cls)
  if (twColor && twColor !== 'transparent') return twColor

  return null
}

// ─── Content Inventory ───────────────────────────────────────

function extractContentInventory(el: any): ContentInventory {
  const headings = Array.from(el.querySelectorAll?.('h1, h2, h3, h4') ?? [])
  const headingLevels = [...new Set(headings.map((h: any) => parseInt(h.tagName.substring(1))))].sort()

  const paragraphs = el.querySelectorAll?.('p') ?? []
  const images = el.querySelectorAll?.('img') ?? []
  const buttons = el.querySelectorAll?.('button, [type="submit"], a.btn, a[class*="button"], a[class*="botao"], a[class*="btn"]') ?? []
  const links = el.querySelectorAll?.('a') ?? []
  const lists = el.querySelectorAll?.('ul, ol') ?? []
  const forms = el.querySelectorAll?.('form') ?? []

  const svgs = el.querySelectorAll?.('svg') ?? []
  const iconEls = el.querySelectorAll?.('i[class*="fa"], i[class*="icon"], i[class*="lucide"], i[class*="bi-"]') ?? []
  const hasIcon = svgs.length > 0 || iconEls.length > 0

  const allText = el.textContent ?? ''
  const statMatches = allText.match(/\b\d{1,5}[\+%]?\s*(?:anos?|clientes?|projetos?|empresas?|years?|clients?|projects?|bi|mil|k|m\b)?/gi)
  const statNumbers = statMatches ? Math.min(statMatches.length, 10) : 0

  return {
    headingCount: headings.length,
    headingLevels: headingLevels as number[],
    paragraphCount: paragraphs.length,
    imageCount: images.length,
    buttonCount: buttons.length + (Array.from(links).filter((a: any) => {
      const cls = (a.getAttribute?.('class') ?? '').toLowerCase()
      return /btn|button|botao|cta/.test(cls)
    })).length,
    listCount: lists.length,
    formCount: forms.length,
    hasIcon,
    statNumbers,
  }
}

// ─── Text Extraction ─────────────────────────────────────────

function extractHeadingTexts(el: any): string[] {
  const headings = Array.from(el.querySelectorAll?.('h1, h2, h3') ?? [])
  return headings
    .map((h: any) => h.textContent?.trim()?.replace(/\s+/g, ' ')?.substring(0, 200) ?? '')
    .filter(Boolean)
    .slice(0, 5)
}

function extractCtaTexts(el: any): string[] {
  const selectors = 'button, a[class*="btn"], a[class*="button"], a[class*="cta"], [class*="btn-primary"]'
  const buttons = Array.from(el.querySelectorAll?.(selectors) ?? [])
  return buttons
    .map((b: any) => b.textContent?.trim()?.replace(/\s+/g, ' ')?.substring(0, 60) ?? '')
    .filter(Boolean)
    .slice(0, 3)
}

// ─── Video Detection ─────────────────────────────────────────

function detectVideo(el: any): { hasVideo: boolean; videoType: 'youtube' | 'vimeo' | 'native' | null } {
  // Native <video> tag
  if (el.querySelector?.('video')) return { hasVideo: true, videoType: 'native' }

  // Iframes: YouTube / Vimeo
  const iframes = Array.from(el.querySelectorAll?.('iframe') ?? [])
  for (const iframe of iframes) {
    const src = (
      ((iframe as any).getAttribute?.('src') ?? '') +
      ((iframe as any).getAttribute?.('data-src') ?? '')
    ).toLowerCase()
    if (src.includes('youtube.com') || src.includes('youtu.be')) return { hasVideo: true, videoType: 'youtube' }
    if (src.includes('vimeo.com')) return { hasVideo: true, videoType: 'vimeo' }
  }

  // Anchor/div with YouTube/Vimeo in href or data attributes
  const anchors = Array.from(el.querySelectorAll?.('a[href*="youtu"], a[href*="vimeo"]') ?? [])
  if (anchors.length > 0) return { hasVideo: true, videoType: 'youtube' }

  return { hasVideo: false, videoType: null }
}

// ─── Repeated Items Detection ────────────────────────────────

function detectRepeatedItems(el: any): RepeatedItemInfo | null {
  const children = Array.from(el.children ?? []).filter(
    (c: any) => c.tagName && !['br', 'hr', 'script', 'style', 'link'].includes(c.tagName.toLowerCase()),
  )

  if (children.length < 2) return null

  interface Sig {
    tag: string
    hasImg: boolean
    hasHeading: boolean
    hasText: boolean
    hasButton: boolean
    hasIcon: boolean
    hasList: boolean
    childCount: number
  }

  function getSig(child: any): Sig {
    return {
      tag: child.tagName?.toLowerCase() ?? '',
      hasImg: !!child.querySelector?.('img'),
      hasHeading: !!child.querySelector?.('h1, h2, h3, h4, h5'),
      hasText: !!child.querySelector?.('p, span'),
      hasButton: !!child.querySelector?.('button, a.btn, a[class*="button"], a[class*="btn"]'),
      hasIcon: !!child.querySelector?.('svg, i[class*="fa"], i[class*="icon"]'),
      hasList: !!child.querySelector?.('ul, ol'),
      childCount: (child.children ?? []).length,
    }
  }

  function sigKey(sig: Sig): string {
    return `${sig.tag}|${sig.hasImg}|${sig.hasHeading}|${sig.hasText}|${sig.hasButton}`
  }

  const sigs = children.map((c: any) => getSig(c))
  const groups = new Map<string, { count: number; sig: Sig }>()

  for (const sig of sigs) {
    const key = sigKey(sig)
    const existing = groups.get(key)
    if (existing) existing.count++
    else groups.set(key, { count: 1, sig })
  }

  let largest: { count: number; sig: Sig } | null = null
  for (const group of groups.values()) {
    if (group.count >= 2 && (!largest || group.count > largest.count)) {
      largest = group
    }
  }

  if (!largest) return null

  const sig = largest.sig
  const estimatedHeight: RepeatedItemStructure['estimatedHeight'] =
    sig.childCount <= 2 ? 'compact' : sig.childCount <= 5 ? 'medium' : 'tall'

  return {
    count: largest.count,
    itemStructure: {
      hasImage: sig.hasImg,
      hasHeading: sig.hasHeading,
      hasText: sig.hasText,
      hasButton: sig.hasButton,
      hasIcon: sig.hasIcon,
      hasList: sig.hasList,
      estimatedHeight,
    },
  }
}

// ─── Deep repeated items ─────────────────────────────────────

function detectRepeatedItemsDeep(el: any): RepeatedItemInfo | null {
  const direct = detectRepeatedItems(el)
  if (direct && direct.count >= 2) return direct

  const children = Array.from(el.children ?? []).filter(
    (c: any) => c.tagName && ['div', 'section', 'ul', 'ol', 'main'].includes(c.tagName?.toLowerCase()),
  )

  for (const wrapper of children) {
    const inner = detectRepeatedItems(wrapper as any)
    if (inner && inner.count >= 2) return inner
  }

  return null
}

// ─── Extract Section ─────────────────────────────────────────

function extractSection(el: any, index: number, total: number, cssRuleMap?: CssRuleMap): ParsedSection {
  const sectionType = detectSectionType(el, index, total)
  const layout = detectLayout(el)
  const backgroundTone = detectBackgroundTone(el)
  const actualBgColor = extractActualBgColor(el)
  const contentInventory = extractContentInventory(el)
  const repeatedItems = detectRepeatedItemsDeep(el)
  const headingTexts = extractHeadingTexts(el)
  const ctaTexts = extractCtaTexts(el)
  const { hasVideo, videoType } = detectVideo(el)

  const heading = el.querySelector?.('h1, h2, h3')
  const paragraph = el.querySelector?.('p')
  const children = el.children ?? []

  const displayNameHint = heading?.textContent?.trim()?.substring(0, 50) ?? null

  // Construir árvore DOM para clonagem fiel da estrutura visual
  const counter = { n: 0 }
  const domTree = cssRuleMap
    ? (buildDomLayoutNode(el, cssRuleMap, 0, counter) ?? undefined)
    : undefined

  return {
    sectionType,
    childCount: children.length,
    hasHeading: !!heading,
    headingText: heading?.textContent?.trim()?.substring(0, 200) ?? null,
    paragraphText: paragraph?.textContent?.trim()?.substring(0, 300) ?? null,
    headingTexts,
    ctaTexts,
    layout,
    backgroundTone,
    actualBgColor,
    contentInventory,
    repeatedItems,
    displayNameHint,
    hasVideo,
    videoType,
    domTree,
  }
}

// ─── External CSS Fetch ───────────────────────────────────────

/**
 * Tenta baixar o arquivo CSS principal do site para extrair variáveis de cor.
 * Retorna o conteúdo CSS ou string vazia se falhar.
 * Seguro: timeout 4s, limite 500KB, apenas mesmo domínio.
 * Prioriza: Elementor post CSS, theme CSS, depois demais arquivos.
 */
async function fetchMainCss(doc: any, baseUrl: string): Promise<string> {
  try {
    const baseDomain = new URL(baseUrl).hostname
    const links = Array.from(doc.querySelectorAll?.('link[rel="stylesheet"]') ?? [])

    // Extrair URLs de CSS do mesmo domínio
    const cssUrls: Array<{ url: string; priority: number }> = []
    for (const link of links) {
      const href = (link as any).getAttribute?.('href') ?? ''
      const id = (link as any).getAttribute?.('id') ?? ''
      if (!href || href.startsWith('data:')) continue
      if (href.includes('fonts.googleapis') || href.includes('fonts.bunny') || href.includes('font-awesome')) continue

      let cssUrl: string
      try {
        cssUrl = new URL(href, baseUrl).toString()
        if (new URL(cssUrl).hostname !== baseDomain) continue
      } catch { continue }

      // Prioridade:
      // 1. Elementor post CSS (tem as variáveis de cor do designer)
      // 2. Arquivos com 'style', 'theme', 'custom', 'main' no nome
      // 3. Demais
      let priority = 0
      if (/elementor\/css\/post-\d+/.test(cssUrl)) priority = 10
      else if (/elementor\/css/.test(cssUrl)) priority = 8
      else if (/custom|theme|style|main|global/.test(href.toLowerCase())) priority = 5
      else if (id && /custom|theme|style|main|global|be-css/.test(id.toLowerCase())) priority = 4

      cssUrls.push({ url: cssUrl, priority })
    }

    // Ordenar por prioridade (maior primeiro)
    cssUrls.sort((a, b) => b.priority - a.priority)

    for (const { url: cssUrl } of cssUrls.slice(0, 6)) {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 4000)
        const resp = await fetch(cssUrl, {
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LandingGenBot/1.0)', Accept: 'text/css' },
        })
        clearTimeout(timeout)

        if (!resp.ok) continue
        const text = await resp.text()
        if (text.length > 500_000) {
          // Para arquivos grandes, pegar só o início (onde ficam as variáveis)
          return text.substring(0, 50_000)
        }
        return text
      } catch { continue }
    }
  } catch { /* silencioso */ }

  return ''
}

/** Parseia CSS baixado externamente para enriquecer a paleta */
function enrichPaletteFromCss(css: string, palette: ColorPalette): void {
  if (!css) return

  // 1. Elementor CSS variables: --e-global-color-primary, --e-global-color-secondary, etc.
  // Exemplo: .elementor-kit-895 { --e-global-color-primary:#0A1334; --e-global-color-secondary:#EE7025; }
  if (!palette.primary) {
    const em = css.match(/--e-global-color-primary\s*:\s*(#[0-9a-fA-F]{3,8})/)
    if (em) palette.primary = normalizeColor(em[1])
  }
  if (!palette.accent) {
    // Elementor secondary é geralmente a cor de destaque (CTA, links)
    const es = css.match(/--e-global-color-secondary\s*:\s*(#[0-9a-fA-F]{3,8})/)
    if (es) {
      const c = normalizeColor(es[1])
      if (classifyColor(c) === 'accent') palette.accent = c
    }
    if (!palette.accent) {
      const ea = css.match(/--e-global-color-accent\s*:\s*(#[0-9a-fA-F]{3,8})/)
      if (ea) {
        const c = normalizeColor(ea[1])
        if (classifyColor(c) === 'accent') palette.accent = c
      }
    }
  }
  if (!palette.text) {
    const et = css.match(/--e-global-color-text\s*:\s*(#[0-9a-fA-F]{3,8})/)
    if (et) palette.text = normalizeColor(et[1])
  }

  // 2. :root { --var: #color } — padrão genérico
  const rootMatch = css.match(/:root\s*\{([^}]+)\}/s)
  if (rootMatch) {
    const root = rootMatch[1]
    const varPatterns: Array<[RegExp, keyof ColorPalette]> = [
      [/--(?:primary|brand|main|cor-principal|color-primary)\s*:\s*(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\))/i, 'primary'],
      [/--(?:accent|secondary|highlight|destaque|color-accent)\s*:\s*(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\))/i, 'accent'],
      [/--(?:background|bg-color|cor-fundo)\s*:\s*(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\))/i, 'background'],
      [/--(?:foreground|text-color|cor-texto)\s*:\s*(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\))/i, 'text'],
    ]
    for (const [regex, key] of varPatterns) {
      if (!palette[key as string]) {
        const m = root.match(regex)
        if (m) palette[key as string] = normalizeColor(m[1])
      }
    }
  }

  // 3. body/html background — padrões do tema
  if (!palette.background) {
    const m = css.match(/(?:html|body)\s*\{[^}]*background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\))/i)
    if (m) palette.background = normalizeColor(m[1])
  }

  // 4. Gradientes em regras CSS que indicam estilo do site
  if (!palette.gradientFrom) {
    applyGradientFromStyle(css.substring(0, 15000), palette)
  }
}

// ─── Font Extraction from External CSS ───────────────────────

/**
 * Tenta extrair a família de fonte principal de CSS externo baixado.
 * Cobre: Elementor typography vars, body font-family, :root vars.
 */
function enrichFontFromCss(css: string): string | null {
  // Elementor typography CSS variables
  // Exemplo: --e-global-typography-primary-font-family: "Montserrat"
  const elementorMatch = css.match(/--e-global-typography-(?:primary|text|accent)\-font-family\s*:\s*["']?([A-Za-z][^;'"]+?)["']?\s*[;}]/)
  if (elementorMatch) {
    const f = elementorMatch[1].trim()
    if (f && !['sans-serif', 'serif', 'monospace', 'inherit'].includes(f.toLowerCase())) return f
  }

  // body { font-family: ... } no CSS externo
  const bodyMatch = css.match(/body\s*\{[^}]*font-family\s*:\s*["']?([A-Za-z][^,;'"]+?)["']?\s*[,;]/)
  if (bodyMatch) {
    const f = bodyMatch[1].trim()
    if (f && !['sans-serif', 'serif', 'monospace', 'inherit', 'initial'].includes(f.toLowerCase())) return f
  }

  // :root { --font-...: ... }
  const rootVarMatch = css.match(/--(?:font-family|font|base-font)\s*:\s*["']?([A-Za-z][^,;'"]+?)["']?\s*[,;]/)
  if (rootVarMatch) {
    const f = rootVarMatch[1].trim()
    if (f && !['sans-serif', 'serif', 'monospace', 'inherit', 'initial'].includes(f.toLowerCase())) return f
  }

  return null
}

// ─── HTML Parsing ────────────────────────────────────────────

async function parseHtml(html: string, sourceUrl: string): Promise<FetchHtmlResponse> {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  if (!doc) {
    return { success: false, title: null, sections: [], colorPalette: null, fontFamily: null, error: 'Falha ao fazer parse do HTML' }
  }

  const title = doc.querySelector('title')?.textContent?.trim() ?? null

  // Extract global data BEFORE removing style tags
  const colorPalette = extractColorPalette(doc)
  let fontFamily = extractFontFamily(doc)

  // Extrair conteúdo dos <style> tags ANTES de removê-los (para o CSS rule map)
  const allStyleTags = Array.from(doc.querySelectorAll?.('style') ?? [])
  let inlineCssContent = ''
  for (const st of allStyleTags) {
    inlineCssContent += '\n' + ((st as any).textContent ?? '')
  }

  // Sempre tentar baixar CSS externo para enriquecer a paleta e extrair fonte
  // (Elementor, Betheme, e outros frameworks geram CSS com variáveis de cor/fonte importantes)
  const externalCss = await fetchMainCss(doc, sourceUrl)
  if (externalCss) {
    enrichPaletteFromCss(externalCss, colorPalette)
    if (!fontFamily) fontFamily = enrichFontFromCss(externalCss)
  }

  // Construir mapa de regras CSS (inline + externo) para resolução de estilos por elemento
  // Limitar inline CSS a 100KB para evitar parsing lento em sites pesados
  const cssForRuleMap = inlineCssContent.substring(0, 100_000) + '\n' + externalCss.substring(0, 100_000)
  const cssRuleMap = parseCssToRuleMap(cssForRuleMap)

  // Remove non-visual elements
  for (const tag of ['script', 'style', 'noscript', 'svg']) {
    doc.querySelectorAll(tag).forEach((el: any) => el.remove())
  }
  // Keep iframes for video detection (already processed above, but sections still need detection)

  const body = doc.querySelector('body')
  if (!body) {
    return { success: false, title, sections: [], colorPalette, fontFamily, error: 'Pagina sem body' }
  }

  // Find top-level sections
  const sectionTags = ['header', 'nav', 'main', 'section', 'article', 'footer', 'div']
  const topElements: any[] = []

  // Estratégia 1: Elementor containers (e-parent) — WordPress + Elementor
  const elementorParents = body.querySelectorAll?.('[data-element_type="container"].e-parent, [data-element_type="section"]')
  const elementorParentList = Array.from(elementorParents ?? [])
  if (elementorParentList.length >= 2) {
    // Filtrar apenas elementos de primeiro nível (não nested)
    for (const el of elementorParentList) {
      const parent = (el as any).parentElement
      if (!parent) continue
      // Só inclui se o pai NÃO é outro elementor-parent
      const parentIsElementor = parent.getAttribute?.('data-element_type') === 'container' ||
                                 parent.getAttribute?.('data-element_type') === 'section'
      if (!parentIsElementor) topElements.push(el)
    }
  }

  // Estratégia 2: estrutura semântica padrão (header, section, footer)
  if (topElements.length < 2) {
    topElements.length = 0
    for (const child of Array.from(body.children)) {
      const tag = (child as any).tagName?.toLowerCase()
      if (sectionTags.includes(tag)) {
        if ((tag === 'main' || tag === 'div') && child.querySelector?.('section, header, footer, nav')) {
          for (const inner of Array.from(child.children)) {
            const innerTag = (inner as any).tagName?.toLowerCase()
            if (sectionTags.includes(innerTag)) {
              topElements.push(inner)
            }
          }
        } else {
          topElements.push(child)
        }
      }
    }
  }

  // Estratégia 3: query por classes de seção comuns
  if (topElements.length < 2) {
    const allSections = body.querySelectorAll?.('section, header, nav, footer, [class*="section"], [class*="block"], [class*="row"]')
    const filtered = Array.from(allSections ?? []).filter((el: any) => {
      // Evitar elementos muito pequenos ou nested
      const children = (el as any).children?.length ?? 0
      return children >= 2
    })
    if (filtered.length >= 2) {
      topElements.length = 0
      filtered.slice(0, 20).forEach((el: any) => topElements.push(el))
    }
  }

  // Último recurso: filhos diretos do body
  if (topElements.length === 0) {
    for (const child of Array.from(body.children)) {
      topElements.push(child)
    }
  }

  const total = topElements.length
  const sections = topElements
    .map((el, i) => extractSection(el, i, total, cssRuleMap))
    .filter((s) => s.childCount > 0 || s.hasHeading)

  // Deduplicate: only one hero, one footer, one navbar
  let hasHero = false
  let hasFooter = false
  let hasNavbar = false
  for (const s of sections) {
    if (s.sectionType === 'navbar') {
      if (hasNavbar) s.sectionType = 'generic'
      hasNavbar = true
    }
    if (s.sectionType === 'hero') {
      if (hasHero) s.sectionType = 'generic'
      hasHero = true
    }
    if (s.sectionType === 'footer') {
      if (hasFooter) s.sectionType = 'generic'
      hasFooter = true
    }
  }

  return { success: true, title, sections, colorPalette, fontFamily }
}

// ─── Edge Function Handler ───────────────────────────────────

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Metodo nao permitido' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  try {
    const { url } = await req.json()

    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ success: false, title: null, sections: [], colorPalette: null, fontFamily: null, error: 'URL obrigatoria' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const validationError = validateUrl(url)
    if (validationError) {
      return new Response(
        JSON.stringify({ success: false, title: null, sections: [], colorPalette: null, fontFamily: null, error: validationError }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)

    let response: Response
    try {
      response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LandingGenBot/1.0)',
          Accept: 'text/html',
        },
      })
    } catch (err) {
      clearTimeout(timeout)
      const msg =
        err instanceof Error && err.name === 'AbortError'
          ? 'Timeout: site demorou mais de 10 segundos para responder'
          : 'Nao foi possivel acessar o site. Verifique se a URL esta correta.'
      return new Response(
        JSON.stringify({ success: false, title: null, sections: [], colorPalette: null, fontFamily: null, error: msg }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    } finally {
      clearTimeout(timeout)
    }

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          success: false, title: null, sections: [], colorPalette: null, fontFamily: null,
          error: `Site retornou status ${response.status}`,
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('text/html')) {
      return new Response(
        JSON.stringify({
          success: false, title: null, sections: [], colorPalette: null, fontFamily: null,
          error: 'A URL nao retornou uma pagina HTML',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const contentLength = response.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 5_000_000) {
      return new Response(
        JSON.stringify({
          success: false, title: null, sections: [], colorPalette: null, fontFamily: null,
          error: 'A pagina e muito grande para ser analisada (limite: 5MB)',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const html = await response.text()
    const result = await parseHtml(html, url)

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return new Response(
      JSON.stringify({ success: false, title: null, sections: [], colorPalette: null, fontFamily: null, error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
