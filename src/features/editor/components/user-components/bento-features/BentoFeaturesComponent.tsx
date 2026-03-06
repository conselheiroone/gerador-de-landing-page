import { useNode, type UserComponent } from '@craftjs/core'
import { BentoFeaturesSettings } from './BentoFeaturesSettings'

export interface BentoItem {
  icon: string
  titulo: string
  descricao: string
  /** 'normal' = 1x1, 'wide' = 2x1 (ocupa 2 colunas) */
  size: 'normal' | 'wide'
  accentColor: string
}

export type BentoFeaturesProps = {
  background: string
  cardBackground: string
  cardRadius: number
  paddingY: number
  items: BentoItem[]
}

const defaultItems: BentoItem[] = [
  { icon: '📊', titulo: 'Contabilidade Digital', descricao: 'Gestão completa das suas obrigações fiscais e contábeis com tecnologia de ponta.', size: 'wide', accentColor: '#6366f1' },
  { icon: '🏛️', titulo: 'Abertura de Empresa', descricao: 'Processo ágil e sem burocracia para formalizar seu negócio.', size: 'normal', accentColor: '#0ea5e9' },
  { icon: '📋', titulo: 'Folha de Pagamento', descricao: 'Cálculo preciso de salários, encargos e benefícios dos colaboradores.', size: 'normal', accentColor: '#10b981' },
  { icon: '🔒', titulo: 'Compliance Fiscal', descricao: 'Acompanhamento contínuo das mudanças tributárias para manter sua empresa em conformidade.', size: 'wide', accentColor: '#f59e0b' },
]

const defaultProps: BentoFeaturesProps = {
  background: '#f8fafc',
  cardBackground: '#ffffff',
  cardRadius: 16,
  paddingY: 72,
  items: defaultItems,
}

export const BentoFeaturesComponent: UserComponent<Partial<BentoFeaturesProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const {
    connectors: { connect, drag },
  } = useNode()

  const { background, cardBackground, cardRadius, paddingY, items } = props

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
          maxWidth: '900px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
          gap: 'clamp(12px, 2vw, 16px)',
        }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              gridColumn: item.size === 'wide' ? '1 / -1' : undefined,
              background: cardBackground,
              borderRadius: `${cardRadius}px`,
              padding: 'clamp(20px, 4vw, 32px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              borderTop: `3px solid ${item.accentColor}`,
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
          >
            <span style={{ fontSize: '32px', lineHeight: '1' }}>{item.icon}</span>
            <h3
              style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#111827',
                margin: 0,
                letterSpacing: '-0.3px',
              }}
            >
              {item.titulo}
            </h3>
            <p
              style={{
                fontSize: '15px',
                color: '#6b7280',
                lineHeight: '1.6',
                margin: 0,
              }}
            >
              {item.descricao}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

BentoFeaturesComponent.craft = {
  displayName: 'Bento de Serviços',
  props: defaultProps,
  rules: {
    canDrag: () => true,
    canMoveIn: () => false,
  },
  related: {
    settings: BentoFeaturesSettings,
  },
}
