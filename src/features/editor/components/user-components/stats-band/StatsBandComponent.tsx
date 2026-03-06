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
}

const defaultStats: StatItem[] = [
  { valor: '10+', label: 'anos de experiência' },
  { valor: '500+', label: 'clientes atendidos' },
  { valor: '98%', label: 'de satisfação' },
]

const defaultProps: StatsBandProps = {
  background: '#111827',
  textColor: '#ffffff',
  accentColor: '#f59e0b',
  labelColor: '#9ca3af',
  paddingY: 48,
  showDivider: true,
  stats: defaultStats,
}

export const StatsBandComponent: UserComponent<Partial<StatsBandProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const {
    connectors: { connect, drag },
  } = useNode()

  const { background, accentColor, labelColor, paddingY, showDivider, stats } = props

  return (
    <section
      ref={(ref) => { if (ref) connect(drag(ref)) }}
      style={{
        width: '100%',
        background,
        padding: `${paddingY}px clamp(16px, 5vw, 40px)`,
      }}
    >
      <div
        style={{
          maxWidth: '1080px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(min(140px, 100%), 1fr))`,
          gap: 'clamp(12px, 3vw, 0px)',
        }}
      >
        {stats.map((stat, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'clamp(4px, 1vw, 10px)',
              padding: 'clamp(6px, 1.5vw, 8px) clamp(8px, 3vw, 32px)',
              borderRight:
                showDivider && i < stats.length - 1
                  ? `1px solid rgba(255,255,255,0.18)`
                  : 'none',
            }}
          >
            <span
              style={{
                fontSize: 'clamp(28px, 7vw, 72px)',
                fontWeight: '800',
                color: accentColor,
                lineHeight: '1',
                letterSpacing: '-2px',
              }}
            >
              {stat.valor}
            </span>
            <span
              style={{
                fontSize: 'clamp(10px, 2.2vw, 15px)',
                fontWeight: '600',
                color: labelColor,
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: 'clamp(0.5px, 0.3vw, 1.5px)',
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
