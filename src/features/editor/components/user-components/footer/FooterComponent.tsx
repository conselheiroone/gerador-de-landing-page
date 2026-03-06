import { useId } from 'react'
import { useNode, type UserComponent } from '@craftjs/core'
import { FooterSettings } from './FooterSettings'

export type FooterProps = {
  background: string
  gradientFrom: string
  gradientTo: string
  gradientType: 'linear' | 'radial' | ''
  gradientDirection: string
  paddingY: number
  columns: number
  /** Max-width do conteúdo interno (bg fica full-width). Ex: '1080px' */
  contentMaxWidth?: string
  children?: React.ReactNode
}

const defaultProps: FooterProps = {
  background: '#111827',
  gradientFrom: '',
  gradientTo: '',
  gradientType: 'linear',
  gradientDirection: '135deg',
  paddingY: 40,
  columns: 3,
}

function resolveBackground(props: FooterProps): string {
  if (!props.gradientFrom || !props.gradientTo) return props.background
  const type = props.gradientType || 'linear'
  if (type === 'radial') {
    const dir = props.gradientDirection || 'circle at bottom right'
    return `radial-gradient(${dir}, ${props.gradientFrom}, ${props.gradientTo})`
  }
  return `linear-gradient(${props.gradientDirection || '135deg'}, ${props.gradientFrom}, ${props.gradientTo})`
}

export const FooterComponent: UserComponent<Partial<FooterProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const {
    connectors: { connect, drag },
  } = useNode()

  const uid = useId().replace(/:/g, '')
  const scopeClass = `ft-${uid}`

  // Últimos 2 filhos (Divider + Rodapé Inferior) ocupam toda a largura do grid
  const gridCss = `
    .${scopeClass} > :nth-last-child(-n+2) { grid-column: 1 / -1; }
    @media (max-width: 640px) {
      .${scopeClass} { grid-template-columns: 1fr !important; }
    }
  `

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
    gap: 'clamp(16px, 3vw, 30px)',
  }

  return (
    <footer
      ref={(ref) => { if (ref) connect(drag(ref)) }}
      style={{
        width: '100%',
        background: resolveBackground(props),
        padding: `${props.paddingY}px clamp(16px, 5vw, 40px)`,
        minHeight: '100px',
      }}
    >
      <style>{gridCss}</style>
      <div
        className={scopeClass}
        style={{
          ...gridStyles,
          maxWidth: props.contentMaxWidth || '1100px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {props.children}
      </div>
    </footer>
  )
}

FooterComponent.craft = {
  displayName: 'Rodape',
  props: defaultProps,
  rules: {
    canDrag: () => true,
  },
  related: {
    settings: FooterSettings,
  },
}
