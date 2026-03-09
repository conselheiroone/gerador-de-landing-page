import { useNode, type UserComponent } from '@craftjs/core'
import { StatsBandSettings } from './StatsBandSettings'

export interface StatItem {
  valor: string
  label: string
}

export type StatsBandProps = {
  background: string
  textColor: string
  accentColor: string
  labelColor: string
  paddingY: number
  /** Separador vertical entre colunas */
  showDivider: boolean
  stats: StatItem[]
  /** Tamanho da fonte do valor (px). Default: 56 */
  fontSize?: number
  /** Tamanho da fonte do label (px). Default: 12 */
  labelFontSize?: number
  /** Peso da fonte do valor. Default: '900' */
  fontWeight?: string
  /** Transformação do texto do label. Default: 'uppercase' */
  labelTextTransform?: 'uppercase' | 'capitalize' | 'lowercase' | 'none'
  /** Espaçamento entre letras do label (px). Default: 2 */
  labelLetterSpacing?: number
  /** Efeito glow/text-shadow no valor. Default: true */
  showGlow?: boolean
}

const defaultStats: StatItem[] = [
  { valor: '10+', label: 'anos de experiência' },
  { valor: '500+', label: 'clientes atendidos' },
  { valor: '98%', label: 'de satisfação' },
]

const defaultProps: StatsBandProps = {
  background: '#111827',
  textColor: '#ffffff',
  accentColor: '#ffffff',
  labelColor: 'rgba(255,255,255,0.7)',
  paddingY: 40,
  showDivider: true,
  stats: defaultStats,
  fontSize: 56,
  labelFontSize: 12,
  fontWeight: '900',
  labelTextTransform: 'uppercase',
  labelLetterSpacing: 2,
  showGlow: true,
}

export const StatsBandComponent: UserComponent<Partial<StatsBandProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const {
    connectors: { connect, drag },
  } = useNode()

  const {
    background,
    accentColor,
    labelColor,
    paddingY,
    showDivider,
    stats,
    fontSize = 56,
    labelFontSize = 12,
    fontWeight = '900',
    labelTextTransform = 'uppercase',
    labelLetterSpacing = 2,
    showGlow = true,
  } = props

  // Glow effect como no HTML de referência
  const glowStyle = showGlow
    ? { textShadow: '0 0 30px rgba(255, 255, 255, 0.5), 0 0 60px rgba(255, 255, 255, 0.3)' }
    : {}

  return (
    <section
      ref={(ref) => { if (ref) connect(drag(ref)) }}
      style={{
        width: '100%',
        background,
        padding: 0,
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
          gap: 0,
        }}
      >
        {stats.map((stat, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: `${paddingY}px 24px`,
              position: 'relative',
            }}
          >
            {/* Divider gradiente vertical (exceto último item) */}
            {showDivider && i < stats.length - 1 && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '1px',
                  height: '50%',
                  background: 'linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.3), transparent)',
                }}
              />
            )}
            <span
              style={{
                fontSize: `clamp(36px, 6vw, ${fontSize}px)`,
                fontWeight,
                color: accentColor,
                lineHeight: '1',
                letterSpacing: '-2px',
                marginBottom: '8px',
                ...glowStyle,
              }}
            >
              {stat.valor}
            </span>
            <span
              style={{
                fontSize: `clamp(11px, 1.5vw, ${labelFontSize}px)`,
                fontWeight: '600',
                color: labelColor,
                textAlign: 'center',
                textTransform: labelTextTransform as React.CSSProperties['textTransform'],
                letterSpacing: `${labelLetterSpacing}px`,
                lineHeight: '1.4',
              }}
            >
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

StatsBandComponent.craft = {
  displayName: 'Faixa de Estatísticas',
  props: defaultProps,
  rules: {
    canDrag: () => true,
    canMoveIn: () => false,
  },
  related: {
    settings: StatsBandSettings,
  },
}
