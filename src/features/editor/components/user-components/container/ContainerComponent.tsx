import { useState } from 'react'
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
    children,
  } = props

  const isPixelWidth = width.endsWith('px')
  const hasImage = !!backgroundImage
  const hasOverlay = hasImage && (overlayOpacity ?? 0) > 0
  const [bgLoaded, setBgLoaded] = useState(!hasImage)

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

  return (
    <div
      id={props.sectionId || undefined}
      ref={(ref) => { if (ref) connect(drag(ref)) }}
      style={{
        position: position || 'relative',
        width: isPixelWidth ? '100%' : width,
        maxWidth: maxWidth || (isPixelWidth ? width : undefined),
        minWidth: minWidth || undefined,
        margin: isPixelWidth ? '0 auto' : undefined,
        marginTop: resolvedMarginTop,
        marginBottom: resolvedMarginBottom,
        height,
        borderRadius: borderRadiusCustom || `${radius}px`,
        boxShadow: resolvedShadow,
        overflow: hasImage ? 'hidden' : undefined,
        border: border || undefined,
        borderTop: borderTopStyle,
        borderLeft: borderLeftStyle,
        borderBottom: borderBottom || undefined,
        backgroundImage: hasImage && bgLoaded ? `url("${backgroundImage}")` : undefined,
        backgroundSize: hasImage ? 'cover' : undefined,
        backgroundPosition: hasImage ? 'center' : undefined,
        background: hasImage ? undefined : background,
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
      }}
    >
      {/* Skeleton enquanto background image carrega */}
      {hasImage && !bgLoaded && (
        <>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: `${radius}px`,
              background: 'linear-gradient(110deg, #e5e7eb 30%, #f3f4f6 50%, #e5e7eb 70%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite linear',
              zIndex: 0,
            }}
          />
          <img
            src={backgroundImage}
            alt=""
            onLoad={() => setBgLoaded(true)}
            onError={() => setBgLoaded(true)}
            style={{ display: 'none' }}
          />
        </>
      )}
      {/* Overlay sobre background image */}
      {hasOverlay && (
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
      )}
      {/* Conteúdo posicionado acima do overlay */}
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
