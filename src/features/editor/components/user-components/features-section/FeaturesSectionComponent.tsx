import { useId } from 'react'
import { useNode, type UserComponent } from '@craftjs/core'
import { FeaturesSectionSettings } from './FeaturesSectionSettings'

export type FeaturesSectionProps = {
  background: string
  columns: number
  gap: number
  paddingY: number
  /** Max-width do conteúdo interno (bg fica full-width). Ex: '1080px' */
  contentMaxWidth?: string
  /** ID de âncora HTML para navegação interna (ex: 'servicos', 'sobre') */
  sectionId?: string
  children?: React.ReactNode
}

const defaultProps: FeaturesSectionProps = {
  background: '#ffffff',
  columns: 3,
  gap: 24,
  paddingY: 60,
}

export const FeaturesSectionComponent: UserComponent<Partial<FeaturesSectionProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const {
    connectors: { connect, drag },
  } = useNode()

  const uid = useId().replace(/:/g, '')
  const scopeClass = `fs-${uid}`

  const gridCss = `
    .${scopeClass} > :first-child { grid-column: 1 / -1; }
    @media (max-width: 640px) {
      .${scopeClass} { grid-template-columns: 1fr !important; }
    }
  `

  return (
    <section
      id={props.sectionId || undefined}
      ref={(ref) => { if (ref) connect(drag(ref)) }}
      style={{
        width: '100%',
        background: props.background,
        padding: `${props.paddingY}px clamp(16px, 5vw, 40px)`,
        minHeight: '150px',
      }}
    >
      <style>{gridCss}</style>
      <div
        className={scopeClass}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
          gap: `${props.gap}px`,
          maxWidth: props.contentMaxWidth || '1100px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {props.children}
      </div>
    </section>
  )
}

FeaturesSectionComponent.craft = {
  displayName: 'Features',
  props: defaultProps,
  rules: {
    canDrag: () => true,
  },
  related: {
    settings: FeaturesSectionSettings,
  },
}
