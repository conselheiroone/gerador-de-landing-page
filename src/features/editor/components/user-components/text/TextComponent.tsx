import { useNode, useEditor, type UserComponent } from '@craftjs/core'
import ContentEditable from 'react-contenteditable'
import { TextSettings } from './TextSettings'

export type TextProps = {
  text: string
  fontSize: string
  textAlign: string
  fontWeight: string
  color: string
  margin: number[]
  /** Line height (ex: '1.5', '1.8') */
  lineHeight?: string
  /** Max width (ex: '480px', '600px') */
  maxWidth?: string
  /** Text transform (uppercase, capitalize, none) */
  textTransform?: 'none' | 'uppercase' | 'capitalize'
  /** Letter spacing (ex: '0.5', '2') */
  letterSpacing?: string
}

const defaultProps: TextProps = {
  text: 'Edite este texto',
  fontSize: '16',
  textAlign: 'left',
  fontWeight: '400',
  color: '#333333',
  margin: [0, 0, 0, 0],
}

export const TextComponent: UserComponent<Partial<TextProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const {
    connectors: { connect },
    actions: { setProp },
  } = useNode()
  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }))

  const {
    text, fontSize, textAlign, fontWeight, color, margin,
    lineHeight, maxWidth, textTransform, letterSpacing,
  } = props

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
      tagName="p"
      style={{
        width: '100%',
        maxWidth: maxWidth || undefined,
        fontSize: `${fontSize}px`,
        textAlign: textAlign as 'left' | 'center' | 'right',
        fontWeight,
        color,
        margin: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
        lineHeight: lineHeight || undefined,
        textTransform: textTransform || undefined,
        letterSpacing: letterSpacing ? `${letterSpacing}px` : undefined,
        outline: 'none',
      }}
    />
  )
}

TextComponent.craft = {
  displayName: 'Texto',
  props: defaultProps,
  related: {
    settings: TextSettings,
  },
}
