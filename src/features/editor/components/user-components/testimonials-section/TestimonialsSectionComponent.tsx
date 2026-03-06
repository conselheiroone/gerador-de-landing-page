import { useNode, type UserComponent } from '@craftjs/core'
import { TestimonialsSectionSettings } from './TestimonialsSectionSettings'

export type TestimonialsSectionProps = {
  background: string
  columns: number
  paddingY: number
  children?: React.ReactNode
}

const defaultProps: TestimonialsSectionProps = {
  background: '#f8fafc',
  columns: 2,
  paddingY: 60,
}

export const TestimonialsSectionComponent: UserComponent<Partial<TestimonialsSectionProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const {
    connectors: { connect, drag },
  } = useNode()

  const minColWidth = Math.max(250, Math.round(600 / props.columns))

  return (
    <section
      ref={(ref) => { if (ref) connect(drag(ref)) }}
      style={{
        width: '100%',
        background: props.background,
        padding: `${props.paddingY}px clamp(16px, 5vw, 40px)`,
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${minColWidth}px, 1fr))`,
        gap: '24px',
        minHeight: '150px',
      }}
    >
      {props.children}
    </section>
  )
}

TestimonialsSectionComponent.craft = {
  displayName: 'Depoimentos',
  props: defaultProps,
  rules: {
    canDrag: () => true,
  },
  related: {
    settings: TestimonialsSectionSettings,
  },
}
