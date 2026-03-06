import { useNode, type UserComponent } from '@craftjs/core'
import { QuoteHighlightSettings } from './QuoteHighlightSettings'

export type QuoteHighlightProps = {
  quote: string
  author: string
  role: string
  background: string
  textColor: string
  accentColor: string
  paddingY: number
}

const defaultProps: QuoteHighlightProps = {
  quote: 'Profissionais excepcionais que transformaram a gestão financeira do nosso negócio. Recomendo com total confiança.',
  author: 'Maria Silva',
  role: 'Diretora Comercial',
  background: '#0f172a',
  textColor: '#ffffff',
  accentColor: '#f59e0b',
  paddingY: 80,
}

export const QuoteHighlightComponent: UserComponent<Partial<QuoteHighlightProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const {
    connectors: { connect, drag },
  } = useNode()

  const { quote, author, role, background, textColor, accentColor, paddingY } = props

  return (
    <section
      ref={(ref) => { if (ref) connect(drag(ref)) }}
      style={{
        width: '100%',
        background,
        padding: `${paddingY}px clamp(24px, 8vw, 80px)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Aspas decorativas gigantes */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-20px',
          left: '32px',
          fontSize: '220px',
          fontWeight: '900',
          color: accentColor,
          opacity: 0.08,
          lineHeight: '1',
          userSelect: 'none',
          fontFamily: 'Georgia, serif',
        }}
      >
        "
      </span>

      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '28px',
        }}
      >
        {/* Linha de acento */}
        <div
          style={{
            width: '48px',
            height: '3px',
            background: accentColor,
            margin: '0 auto',
          }}
        />

        {/* Citação */}
        <p
          style={{
            fontSize: 'clamp(18px, 3vw, 26px)',
            fontWeight: '400',
            color: textColor,
            lineHeight: '1.7',
            fontStyle: 'italic',
            margin: 0,
          }}
        >
          "{quote}"
        </p>

        {/* Autor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span
            style={{
              fontSize: '16px',
              fontWeight: '700',
              color: accentColor,
              letterSpacing: '0.5px',
            }}
          >
            {author}
          </span>
          <span
            style={{
              fontSize: '13px',
              fontWeight: '500',
              color: textColor,
              opacity: 0.6,
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            {role}
          </span>
        </div>
      </div>
    </section>
  )
}

QuoteHighlightComponent.craft = {
  displayName: 'Depoimento Destaque',
  props: defaultProps,
  rules: {
    canDrag: () => true,
    canMoveIn: () => false,
  },
  related: {
    settings: QuoteHighlightSettings,
  },
}
