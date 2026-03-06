import { useNode, type UserComponent } from '@craftjs/core'
import { TestimonialsGridSettings } from './TestimonialsGridSettings'

export interface TestimonialItem {
  nomeCliente: string
  cargo: string
  citacao: string
  nota: number
  accentColor?: string
}

export type TestimonialsGridProps = {
  depoimentos: TestimonialItem[]
  background: string
  cardBackground: string
  accentColor: string
  textColor: string
  paddingY: number
  columns: 1 | 2 | 3
  showStars: boolean
  sectionTag: string
  sectionTitle: string
}

const DEFAULT_DEPOIMENTOS: TestimonialItem[] = [
  {
    nomeCliente: 'Carlos Mendes',
    cargo: 'Empresário',
    citacao: 'Excelente atendimento! A equipe resolveu todas as nossas pendências fiscais com agilidade e transparência. Recomendo muito.',
    nota: 5,
  },
  {
    nomeCliente: 'Fernanda Oliveira',
    cargo: 'Diretora Administrativa',
    citacao: 'Profissionais competentes e sempre disponíveis. Desde que contratamos o escritório, nossa gestão contábil ficou muito mais tranquila.',
    nota: 5,
  },
  {
    nomeCliente: 'Roberto Costa',
    cargo: 'Sócio-proprietário',
    citacao: 'Ótima experiência. Planejamento tributário bem feito, resultou em economia real para a empresa. Parceria de anos!',
    nota: 5,
  },
]

const defaultProps: TestimonialsGridProps = {
  depoimentos: DEFAULT_DEPOIMENTOS,
  background: '#f8fafc',
  cardBackground: '#ffffff',
  accentColor: '#f59e0b',
  textColor: '#0f172a',
  paddingY: 80,
  columns: 3,
  showStars: true,
  sectionTag: 'DEPOIMENTOS',
  sectionTitle: 'O que nossos clientes dizem',
}

export const TestimonialsGridComponent: UserComponent<Partial<TestimonialsGridProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const { connectors: { connect, drag } } = useNode()

  const {
    background, cardBackground, accentColor, textColor,
    paddingY, showStars, sectionTag, sectionTitle, depoimentos,
  } = props

  return (
    <section
      ref={(ref) => { if (ref) connect(drag(ref)) }}
      style={{
        width: '100%',
        background,
        padding: `${paddingY}px clamp(16px, 5vw, 80px)`,
      }}
    >
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        {/* Cabeçalho */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{
            fontSize: '12px',
            fontWeight: '700',
            letterSpacing: '2px',
            textTransform: 'uppercase' as const,
            color: accentColor,
            margin: '0 0 12px',
          }}>
            {sectionTag}
          </p>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: '800',
            color: textColor,
            margin: 0,
            letterSpacing: '-0.5px',
            lineHeight: '1.2',
          }}>
            {sectionTitle}
          </h2>
        </div>

        {/* Grid de cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(min(260px, 100%), 1fr))`,
          gap: 'clamp(16px, 3vw, 24px)',
        }}>
          {depoimentos.map((dep, i) => (
            <div
              key={i}
              style={{
                background: cardBackground,
                borderRadius: '16px',
                padding: 'clamp(20px, 4vw, 32px)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                borderTop: `3px solid ${dep.accentColor || accentColor}`,
              }}
            >
              {showStars && (
                <div style={{ display: 'flex', gap: '2px' }}>
                  {Array.from({ length: 5 }).map((_, s) => (
                    <span
                      key={s}
                      style={{
                        color: s < dep.nota ? (dep.accentColor || accentColor) : '#e2e8f0',
                        fontSize: '16px',
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              )}

              <p style={{
                fontSize: '15px',
                fontWeight: '400',
                color: '#475569',
                lineHeight: '1.7',
                margin: 0,
                fontStyle: 'italic',
                flex: 1,
              }}>
                "{dep.citacao}"
              </p>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <p style={{ fontSize: '15px', fontWeight: '700', color: textColor, margin: '0 0 2px' }}>
                  {dep.nomeCliente}
                </p>
                <p style={{ fontSize: '13px', fontWeight: '500', color: dep.accentColor || accentColor, margin: 0 }}>
                  {dep.cargo}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

TestimonialsGridComponent.craft = {
  displayName: 'Grade de Depoimentos',
  props: defaultProps,
  rules: {
    canDrag: () => true,
    canMoveIn: () => false,
  },
  related: {
    settings: TestimonialsGridSettings,
  },
}
