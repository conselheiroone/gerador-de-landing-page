import { useNode, type UserComponent } from '@craftjs/core'
import { CtaSectionSettings } from './CtaSectionSettings'

export type CtaSectionProps = {
  background: string
  paddingY: number
  radius: number
  /** Max-width do conteúdo interno (bg fica full-width). Ex: '1080px' */
  contentMaxWidth?: string
  /** ID de âncora HTML para navegação interna (ex: 'contato') */
  sectionId?: string
  children?: React.ReactNode
}

const defaultProps: CtaSectionProps = {
  background: '#2563eb',
  paddingY: 50,
  radius: 12,
}

export const CtaSectionComponent: UserComponent<Partial<CtaSectionProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const {
    connectors: { connect, drag },
  } = useNode()

  const contentStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    textAlign: 'center',
  }

  return (
    <section
      id={props.sectionId || undefined}
      ref={(ref) => { if (ref) connect(drag(ref)) }}
      style={{
        width: '100%',
        background: props.background,
        padding: `${props.paddingY}px clamp(16px, 5vw, 40px)`,
        borderRadius: `${props.radius}px`,
        minHeight: '120px',
        ...(props.contentMaxWidth ? {} : contentStyles),
      }}
    >
      {props.contentMaxWidth ? (
        <div style={{ ...contentStyles, maxWidth: props.contentMaxWidth, margin: '0 auto', width: '100%' }}>
          {props.children}
        </div>
      ) : props.children}
    </section>
  )
}

CtaSectionComponent.craft = {
  displayName: 'CTA',
  props: defaultProps,
  rules: {
    canDrag: () => true,
  },
  related: {
    settings: CtaSectionSettings,
  },
}
