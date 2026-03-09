import { useState } from 'react'
import { useNode, type UserComponent } from '@craftjs/core'
import { HeroSectionSettings } from './HeroSectionSettings'

export type HeroSectionProps = {
  background: string
  gradientFrom: string
  gradientTo: string
  gradientDirection: string
  /** 'linear' | 'radial' | '' — vazio usa apenas background sólido */
  gradientType: 'linear' | 'radial' | ''
  paddingY: number
  /** Padding top específico (sobrescreve paddingY para o topo) */
  paddingTop?: number
  /** Padding bottom específico (sobrescreve paddingY para a base) */
  paddingBottom?: number
  minHeight: number
  textAlign: string
  // ── Design profissional ──────────────────────────────────
  /** URL de imagem de fundo (substitui gradiente) */
  backgroundImage?: string
  /** Opacidade do overlay escuro sobre a imagem (0–1) */
  overlayOpacity?: number
  /** Cor do overlay (default '#000000') */
  overlayColor?: string
  /** Altura mínima em vh (ex: 80 = 80vh) — sobrescreve minHeight */
  minHeightVh?: number
  /** Altura mínima como calc() string (ex: 'calc(100vh - 140px)') */
  minHeightCalc?: string
  /** Ativa parallax scrolling no background */
  parallax?: boolean
  /** Max-width do conteúdo interno (bg fica full-width). Ex: '1080px' */
  contentMaxWidth?: string
  children?: React.ReactNode
}

const defaultProps: HeroSectionProps = {
  background: '#0f172a',
  gradientFrom: '',
  gradientTo: '',
  gradientDirection: '135deg',
  gradientType: 'linear',
  paddingY: 60,
  minHeight: 200,
  textAlign: 'center',
  overlayOpacity: 0,
  overlayColor: '#000000',
  parallax: false,
}

function buildBackground(props: HeroSectionProps): string {
  // Imagem de fundo tem prioridade
  if (props.backgroundImage) return 'transparent'

  if (!props.gradientFrom || !props.gradientTo) return props.background

  const type = props.gradientType || 'linear'
  if (type === 'radial') {
    const direction = props.gradientDirection || 'circle at bottom right'
    return `radial-gradient(${direction}, ${props.gradientFrom}, ${props.gradientTo})`
  }
  return `linear-gradient(${props.gradientDirection || '135deg'}, ${props.gradientFrom}, ${props.gradientTo})`
}

export const HeroSectionComponent: UserComponent<Partial<HeroSectionProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const {
    connectors: { connect, drag },
  } = useNode()

  const bg = buildBackground(props)
  const hasImage = !!props.backgroundImage
  const hasOverlay = hasImage && (props.overlayOpacity ?? 0) > 0

  // Resolução de minHeight: calc > vh > px
  const resolvedMinHeight = props.minHeightCalc
    ? props.minHeightCalc
    : props.minHeightVh
      ? `${props.minHeightVh}vh`
      : `${props.minHeight}px`

  // Resolução de padding: específico > geral
  const paddingTop = props.paddingTop ?? props.paddingY
  const paddingBottom = props.paddingBottom ?? props.paddingY

  const [bgLoaded, setBgLoaded] = useState(!hasImage)

  return (
    <section
      ref={(ref) => { if (ref) connect(drag(ref)) }}
      style={{
        position: 'relative',
        width: '100%',
        background: bg,
        backgroundImage: hasImage && bgLoaded ? `url("${props.backgroundImage}")` : undefined,
        backgroundSize: hasImage ? 'cover' : undefined,
        backgroundPosition: hasImage ? 'center' : undefined,
        backgroundAttachment: hasImage && props.parallax ? 'fixed' : undefined,
        minHeight: resolvedMinHeight,
        overflow: 'hidden',
      }}
    >
      {/* Preload da imagem de fundo + skeleton */}
      {hasImage && !bgLoaded && (
        <>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(110deg, #e5e7eb 30%, #f3f4f6 50%, #e5e7eb 70%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite linear',
              zIndex: 0,
            }}
          />
          <img
            src={props.backgroundImage}
            alt=""
            onLoad={() => setBgLoaded(true)}
            onError={() => setBgLoaded(true)}
            style={{ display: 'none' }}
          />
        </>
      )}
      {/* Overlay sobre imagem de fundo (suporta cor sólida ou gradiente) */}
      {hasOverlay && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            // Se overlayColor contém "gradient", usa como background; caso contrário, usa como backgroundColor
            ...(props.overlayColor?.includes('gradient')
              ? { background: props.overlayColor, opacity: props.overlayOpacity }
              : { backgroundColor: props.overlayColor || '#000000', opacity: props.overlayOpacity }),
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}
      {/* Conteúdo */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          paddingTop: `${paddingTop}px`,
          paddingBottom: `${paddingBottom}px`,
          paddingLeft: 'clamp(16px, 5vw, 40px)',
          paddingRight: 'clamp(16px, 5vw, 40px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems:
            props.textAlign === 'center'
              ? 'center'
              : props.textAlign === 'right'
                ? 'flex-end'
                : 'flex-start',
          gap: '20px',
          minHeight: resolvedMinHeight,
          textAlign: props.textAlign as 'left' | 'center' | 'right',
          ...(props.contentMaxWidth ? { maxWidth: props.contentMaxWidth, margin: '0 auto' } : {}),
        }}
      >
        {props.children}
      </div>
    </section>
  )
}

HeroSectionComponent.craft = {
  displayName: 'Hero',
  props: defaultProps,
  custom: {
    resizable: {
      directions: ['s'],
      heightProp: 'minHeight',
      minHeight: 100,
    },
  },
  rules: {
    canDrag: () => true,
  },
  related: {
    settings: HeroSectionSettings,
  },
}
