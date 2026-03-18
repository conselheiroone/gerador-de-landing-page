import { useNode, type UserComponent } from '@craftjs/core'
import { ContainerSettings } from './ContainerSettings'

export type ContainerProps = {
  background: string
  padding: number
  gap: number
  flexDirection: string
  alignItems: string
  justifyContent: string
  width: string
  height: string
  shadow: number
  radius: number
  /** ID de âncora HTML para navegação interna (ex: 'servicos', 'sobre') */
  sectionId?: string
  /** Família de fonte CSS herdada por todos os filhos (ex: "Montserrat", "Poppins") */
  fontFamily?: string
  // ── Design profissional ──────────────────────────────────
  /** URL de imagem de fundo (background-image cover) */
  backgroundImage?: string
  /** Cor do overlay sobre a backgroundImage (ex: '#000000') */
  overlayColor?: string
  /** Opacidade do overlay 0–1 */
  overlayOpacity?: number
  /** Cor de acento aplicada como borda */
  borderAccent?: string
  /** Posição da borda de acento */
  borderAccentPosition?: 'top' | 'left' | 'none'
  /** Preset de sombra profissional */
  boxShadowPreset?: 'none' | 'soft' | 'elevated' | 'dramatic'
  /** Altura mínima em px (sobrescreve o padrão de 60px) */
  minHeight?: number
  // ── Layout avançado ──────────────────────────────────────
  /** Largura mínima (ex: '300px') — útil para colunas responsivas */
  minWidth?: string
  /** Largura máxima (ex: '1200px') */
  maxWidth?: string
  /** Margem superior em px */
  marginTop?: number
  /** Margem inferior em px */
  marginBottom?: number
  /** Padding vertical em px (sobrescreve padding) */
  paddingY?: number
  /** Padding horizontal em px (sobrescreve padding) */
  paddingX?: number
  /** Flex property (ex: '1 0 auto', '0 0 50%') */
  flex?: string
  /** Posicionamento CSS */
  position?: 'static' | 'relative' | 'absolute' | 'fixed'
  /** Distância do topo (quando position != static) */
  top?: string
  /** Distância da direita (quando position != static) */
  right?: string
  /** Distância da base (quando position != static) */
  bottom?: string
  /** Distância da esquerda (quando position != static) */
  left?: string
  /** Z-index para controle de empilhamento */
  zIndex?: number
  /** Flex-wrap explícito (default: wrap quando flexDirection='row') */
  flexWrap?: 'wrap' | 'nowrap'
  /** Borda customizada (ex: '3px solid rgba(255,255,255,0.2)') */
  border?: string
  /** Borda inferior customizada (ex: 'none') */
  borderBottom?: string
  /** Border-radius customizado (ex: '20px 20px 0 0') - sobrescreve radius */
  borderRadiusCustom?: string
  /** Transform CSS (ex: 'translateX(-50%)') */
  transform?: string
  /** Backdrop filter (ex: 'blur(10px)') */
  backdropFilter?: string
  /** Box-shadow customizado (ex: '0 10px 30px rgba(0,0,0,0.15)') */
  boxShadowCustom?: string
  /** Preset de animação CSS */
  animationPreset?: 'none' | 'float' | 'fadeInUp' | 'fadeInRight'
  /** Pointer-events CSS (ex: 'none' para elementos decorativos que não devem interceptar cliques) */
  pointerEvents?: 'auto' | 'none'
  /** Moldura decorativa renderizada como div HTML puro (z-index: 1, atrás dos filhos Craft.js) */
  decorativeFrame?: {
    width: string
    height: string
    border: string
    borderRadius: string
    borderBottom?: string
  }
  children?: React.ReactNode
}

const defaultProps: ContainerProps = {
  background: '#ffffff',
  padding: 20,
  gap: 10,
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  width: '100%',
  height: 'auto',
  shadow: 0,
  radius: 0,
  overlayOpacity: 0,
  borderAccentPosition: 'none',
  boxShadowPreset: 'none',
}

const SHADOW_PRESETS: Record<string, string> = {
  none: 'none',
  soft: '0 2px 15px rgba(0,0,0,0.06)',
  elevated: '0 8px 30px rgba(0,0,0,0.12)',
  dramatic: '0 20px 60px rgba(0,0,0,0.25)',
}

const ANIMATION_MAP: Record<string, string> = {
  none: 'none',
  float: 'lp-float 3s ease-in-out infinite',
  fadeInUp: 'lp-fadeInUp 0.6s ease both',
  fadeInRight: 'lp-fadeInRight 0.8s ease both',
}

// Injeta keyframes globais (uma única vez)
const KEYFRAMES_ID = 'lp-container-keyframes'
function ensureKeyframes() {
  if (typeof document === 'undefined') return
  if (document.getElementById(KEYFRAMES_ID)) return
  const style = document.createElement('style')
  style.id = KEYFRAMES_ID
  style.textContent = `
@keyframes lp-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
@keyframes lp-fadeInUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
@keyframes lp-fadeInRight { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
  `
  document.head.appendChild(style)
}

export const ContainerComponent: UserComponent<Partial<ContainerProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const {
    connectors: { connect, drag },
  } = useNode()

  const {
    background,
    padding,
    gap,
    flexDirection,
    alignItems,
    justifyContent,
    width,
    height,
    shadow,
    radius,
    fontFamily,
    backgroundImage,
    overlayColor,
    overlayOpacity,
    borderAccent,
    borderAccentPosition,
    boxShadowPreset,
    minHeight,
    minWidth,
    maxWidth,
    marginTop,
    marginBottom,
    paddingY,
    paddingX,
    flex,
    position,
    top,
    right,
    bottom,
    left,
    zIndex,
    flexWrap,
    border,
    borderBottom,
    borderRadiusCustom,
    transform,
    backdropFilter,
    boxShadowCustom,
    animationPreset,
    pointerEvents,
    decorativeFrame,
    children,
  } = props

  // Injeta keyframes CSS se necessário
  if (animationPreset && animationPreset !== 'none') ensureKeyframes()

  const isPixelWidth = width.endsWith('px')
  const hasImage = !!backgroundImage
  const hasOverlay = hasImage && (overlayOpacity ?? 0) > 0

  const resolvedShadow =
    boxShadowCustom
      ? boxShadowCustom
      : boxShadowPreset && boxShadowPreset !== 'none'
        ? SHADOW_PRESETS[boxShadowPreset]
        : shadow === 0
          ? 'none'
          : `0px 3px 100px ${shadow}px rgba(0,0,0,0.13)`

  const borderTopStyle =
    borderAccent && borderAccentPosition === 'top'
      ? `4px solid ${borderAccent}`
      : undefined
  const borderLeftStyle =
    borderAccent && borderAccentPosition === 'left'
      ? `4px solid ${borderAccent}`
      : undefined

  // Resolve padding (paddingY/paddingX têm prioridade)
  const resolvedPaddingY = paddingY ?? padding
  const resolvedPaddingX = paddingX ?? padding
  const resolvedPadding = `${resolvedPaddingY}px ${resolvedPaddingX}px`

  // Resolve margin
  const resolvedMarginTop = marginTop ? `${marginTop}px` : undefined
  const resolvedMarginBottom = marginBottom ? `${marginBottom}px` : undefined

  // Resolve flexWrap (default: wrap quando flexDirection='row')
  const resolvedFlexWrap = flexWrap ?? (flexDirection === 'row' ? 'wrap' : undefined)

  // ── Estilos comuns ──
  const baseStyles: React.CSSProperties = {
    position: position || 'relative',
    width: isPixelWidth ? '100%' : width,
    maxWidth: maxWidth || (isPixelWidth ? width : undefined),
    minWidth: minWidth || undefined,
    margin: isPixelWidth ? '0 auto' : undefined,
    marginTop: resolvedMarginTop,
    marginBottom: resolvedMarginBottom,
    height,
    borderRadius: borderRadiusCustom || (radius > 0 ? `${radius}px` : undefined),
    boxShadow: resolvedShadow !== 'none' ? resolvedShadow : undefined,
    border: border || undefined,
    ...(borderTopStyle ? { borderTop: borderTopStyle } : {}),
    ...(borderLeftStyle ? { borderLeft: borderLeftStyle } : {}),
    ...(borderBottom ? { borderBottom } : {}),
    fontFamily: fontFamily || undefined,
    flex: flex || undefined,
    top: top || undefined,
    right: right || undefined,
    bottom: bottom || undefined,
    left: left || undefined,
    zIndex: zIndex || undefined,
    transform: transform || undefined,
    backdropFilter: backdropFilter || undefined,
    WebkitBackdropFilter: backdropFilter || undefined,
    animation: animationPreset && animationPreset !== 'none'
      ? ANIMATION_MAP[animationPreset]
      : undefined,
    pointerEvents: pointerEvents || undefined,
  }

  // Classes CSS para container queries no editor + card hover
  const isCard = resolvedShadow !== 'none' && (radius > 0 || !!borderRadiusCustom)
  const cssClasses = [
    flexDirection === 'row' ? 'lp-row' : '',
    isCard ? 'lp-card' : '',
  ].filter(Boolean).join(' ') || undefined

  // Elemento de moldura decorativa (renderizado como div HTML puro, fora do Craft.js,
  // garantindo z-index correto — moldura atrás, filhos Craft.js na frente)
  const frameElement = decorativeFrame ? (
    <div
      style={{
        position: 'absolute' as const,
        width: decorativeFrame.width,
        height: decorativeFrame.height,
        border: decorativeFrame.border,
        borderRadius: decorativeFrame.borderRadius,
        borderBottom: decorativeFrame.borderBottom || undefined,
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1,
        pointerEvents: 'none' as const,
      }}
    />
  ) : null

  // ── SEM overlay: div único (evita inner div intermediário que quebra
  //    resolução de height % em filhos position:absolute como Frame Decorativo) ──
  if (!hasOverlay) {
    return (
      <div
        id={props.sectionId || undefined}
        className={cssClasses}
        ref={(ref) => { if (ref) connect(drag(ref)) }}
        style={{
          ...baseStyles,
          overflow: hasImage ? 'hidden' : undefined,
          backgroundImage: hasImage ? `url("${backgroundImage}")` : undefined,
          backgroundSize: hasImage ? 'cover' : undefined,
          backgroundPosition: hasImage ? 'center' : undefined,
          background: hasImage ? undefined : background,
          display: 'flex',
          flexDirection: flexDirection as 'row' | 'column',
          flexWrap: resolvedFlexWrap,
          alignItems,
          justifyContent,
          padding: resolvedPadding,
          gap: `${gap}px`,
          minHeight: position === 'absolute' ? `${minHeight ?? 0}px` : `${minHeight ?? 60}px`,
        }}
      >
        {frameElement}
        {children}
      </div>
    )
  }

  // ── COM overlay: dois divs (outer para bg/image + overlay div + inner para conteúdo) ──
  return (
    <div
      id={props.sectionId || undefined}
      className={cssClasses}
      ref={(ref) => { if (ref) connect(drag(ref)) }}
      style={{
        ...baseStyles,
        overflow: 'hidden',
        backgroundImage: `url("${backgroundImage}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        background: undefined,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: overlayColor || '#000000',
          opacity: overlayOpacity,
          borderRadius: `${radius}px`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: flexDirection as 'row' | 'column',
          flexWrap: resolvedFlexWrap,
          alignItems,
          justifyContent,
          padding: resolvedPadding,
          gap: `${gap}px`,
          minHeight: `${minHeight ?? 60}px`,
          width: '100%',
          height: '100%',
        }}
      >
        {frameElement}
        {children}
      </div>
    </div>
  )
}

ContainerComponent.craft = {
  displayName: 'Container',
  props: defaultProps,
  custom: {
    resizable: {
      directions: ['e', 'w', 's', 'se', 'sw'],
      widthProp: 'width',
      heightProp: 'height',
      minWidth: 50,
      minHeight: 30,
    },
  },
  rules: {
    canDrag: () => true,
  },
  related: {
    settings: ContainerSettings,
  },
}
