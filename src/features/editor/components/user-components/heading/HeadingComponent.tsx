import { useNode, useEditor, type UserComponent } from '@craftjs/core'
import ContentEditable from 'react-contenteditable'
import { HeadingSettings } from './HeadingSettings'

export type HeadingProps = {
  text: string
  tagName: 'h1' | 'h2' | 'h3' | 'h4'
  fontSize: string
  textAlign: string
  fontWeight: string
  color: string
  // ── Design profissional ──────────────────────────────────
  /** Ex: '-2px' para tipografia tight, '4px' para display spread */
  letterSpacing?: string
  /** Ex: '1.1' para títulos, '1.4' para subtítulos */
  lineHeight?: string
  textTransform?: 'none' | 'uppercase' | 'capitalize'
  /** Largura máxima para controle de linha (ex: '700px') */
  maxWidth?: string
  /** Margin [top, right, bottom, left] em px */
  margin?: number[]
}

const defaultProps: HeadingProps = {
  text: 'Título da Seção',
  tagName: 'h2',
  fontSize: '32',
  textAlign: 'left',
  fontWeight: '700',
  color: '#111827',
  letterSpacing: 'normal',
  lineHeight: '1.2',
  textTransform: 'none',
  margin: [0, 0, 0, 0],
}

export const HeadingComponent: UserComponent<Partial<HeadingProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const {
    connectors: { connect },
    actions: { setProp },
  } = useNode()
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }))

  const {
    text,
    fontSize,
    textAlign,
    fontWeight,
    color,
    tagName,
    letterSpacing,
    lineHeight,
    textTransform,
    maxWidth,
    margin,
  } = props

  const marginStyle = margin && margin.length === 4
    ? `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`
    : undefined

  return (
    <ContentEditable
      innerRef={connect}
      html={text}
      disabled={!enabled}
      onChange={(e) => {
        setProp((p: Record<string, unknown>) => {
          p.text = e.target.value.replace(/<\/?[^>]+(>|$)/g, '')
        }, 500)
      }}
      tagName={tagName}
      style={{
        width: '100%',
        maxWidth: maxWidth || undefined,
        fontSize: `${fontSize}px`,
        textAlign: textAlign as 'left' | 'center' | 'right',
        fontWeight,
        color,
        lineHeight: lineHeight || '1.2',
        letterSpacing: letterSpacing || 'normal',
        textTransform: textTransform || 'none',
        margin: marginStyle,
        outline: 'none',
      }}
    />
  )
}

HeadingComponent.craft = {
  displayName: 'Título',
  props: defaultProps,
  related: {
    settings: HeadingSettings,
  },
}
