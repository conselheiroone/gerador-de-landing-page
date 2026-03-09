import { useId } from 'react'
import { useNode, type UserComponent } from '@craftjs/core'
import { SegmentsSettings } from './SegmentsSettings'

export interface SegmentItem {
  icon: string
  titulo: string
  descricao: string
}

export type SegmentsProps = {
  /** Cor de fundo da seção */
  background: string
  /** Cor de fundo do gradiente para */
  backgroundTo?: string
  /** Cor primária (ícones no hover) */
  primaryColor: string
  /** Cor primária clara (fundo dos ícones) */
  primaryLight: string
  /** Cor primária mais clara (gradiente do fundo) */
  primaryLighter?: string
  /** Cor primária com alpha 10% (bordas) */
  primaryAlpha10?: string
  /** Cor primária com alpha 15% (borda tracejada) */
  primaryAlpha15?: string
  /** Cor primária com alpha 30% (sombras e hover) */
  primaryAlpha30?: string
  /** Cor do título */
  titleColor: string
  /** Cor do texto */
  textColor: string
  /** Cor secundária (tag/divider) */
  accentColor: string
  /** Padding vertical (px) */
  paddingY: number
  /** Lista de segmentos */
  segments: SegmentItem[]
  /** Tag/label acima do título */
  sectionTag: string
  /** Título da seção */
  sectionTitle: string
  /** Descrição da seção */
  sectionDescription: string
  /** Largura máxima do conteúdo */
  contentMaxWidth?: string
  /** ID de âncora para navegação */
  sectionId?: string
}

const DEFAULT_SEGMENTS: SegmentItem[] = [
  { icon: '🌾', titulo: 'Agronegócios', descricao: 'Produtores rurais, cooperativas e empresas do setor agrícola.' },
  { icon: '🚀', titulo: 'Startups', descricao: 'Empresas de tecnologia e inovação em fase de crescimento.' },
  { icon: '💊', titulo: 'Farmácias', descricao: 'Drogarias, farmácias de manipulação e distribuidoras.' },
  { icon: '⚕️', titulo: 'Médicos e Saúde', descricao: 'Clínicas, consultórios e profissionais da área da saúde.' },
  { icon: '🏪', titulo: 'Comércio', descricao: 'Lojas, restaurantes e estabelecimentos comerciais.' },
  { icon: '🏗️', titulo: 'Construção Civil', descricao: 'Construtoras, empreiteiras e prestadores de serviços.' },
]

const defaultProps: SegmentsProps = {
  background: '#f0faf8',
  backgroundTo: '#ffffff',
  primaryColor: '#0e6f5c',
  primaryLight: '#f0faf8',
  primaryLighter: '#e0f5f0',
  primaryAlpha10: 'rgba(14, 111, 92, 0.1)',
  primaryAlpha15: 'rgba(14, 111, 92, 0.15)',
  primaryAlpha30: 'rgba(14, 111, 92, 0.3)',
  titleColor: '#0f172a',
  textColor: '#64748b',
  accentColor: '#123f63',
  paddingY: 80,
  segments: DEFAULT_SEGMENTS,
  sectionTag: 'QUEM ATENDEMOS',
  sectionTitle: 'Segmentos de Atuação',
  sectionDescription: 'Experiência comprovada em diversos setores da economia.',
}

export const SegmentsComponent: UserComponent<Partial<SegmentsProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const {
    connectors: { connect, drag },
  } = useNode()

  const uid = useId().replace(/:/g, '')
  const scopeClass = `seg-${uid}`

  // Valores com fallback para as props de alpha
  const pLighter = props.primaryLighter || props.primaryLight
  const pAlpha10 = props.primaryAlpha10 || 'rgba(0, 0, 0, 0.1)'
  const pAlpha15 = props.primaryAlpha15 || 'rgba(0, 0, 0, 0.15)'
  const pAlpha30 = props.primaryAlpha30 || 'rgba(0, 0, 0, 0.3)'

  // CSS animations para hover effects - usando cores das props
  const animationsCss = `
    @keyframes ${scopeClass}-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .${scopeClass}-card {
      background: white;
      border-radius: 20px;
      padding: 36px 28px;
      text-align: center;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    .${scopeClass}-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, ${props.primaryColor} 0%, ${props.primaryLight} 100%);
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }
    .${scopeClass}-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
    }
    .${scopeClass}-card:hover::before {
      transform: scaleX(1);
    }
    .${scopeClass}-icon {
      width: 90px;
      height: 90px;
      background: linear-gradient(145deg, ${props.primaryLight} 0%, ${pLighter} 100%);
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 40px;
      position: relative;
      border: 2px solid ${pAlpha10};
      transition: background 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
    }
    .${scopeClass}-icon::before {
      content: '';
      position: absolute;
      inset: -6px;
      border-radius: 30px;
      border: 2px dashed ${pAlpha15};
      transition: border-color 0.3s ease;
    }
    .${scopeClass}-card:hover .${scopeClass}-icon {
      background: linear-gradient(145deg, ${props.primaryColor} 0%, ${props.primaryLight} 100%);
      transform: scale(1.05) rotate(3deg);
      box-shadow: 0 12px 32px ${pAlpha30};
    }
    .${scopeClass}-card:hover .${scopeClass}-icon::before {
      border-color: ${pAlpha30};
      animation: ${scopeClass}-spin 8s linear infinite;
    }
    @media (max-width: 968px) {
      .${scopeClass}-grid { grid-template-columns: repeat(2, 1fr) !important; }
    }
    @media (max-width: 640px) {
      .${scopeClass}-grid { grid-template-columns: 1fr !important; }
    }
  `

  const bgStyle = props.backgroundTo
    ? `linear-gradient(180deg, ${props.background} 0%, ${props.backgroundTo} 100%)`
    : props.background

  return (
    <section
      id={props.sectionId || undefined}
      ref={(ref) => { if (ref) connect(drag(ref)) }}
      style={{
        width: '100%',
        background: bgStyle,
        padding: `${props.paddingY}px clamp(16px, 5vw, 40px)`,
      }}
    >
      <style>{animationsCss}</style>
      <div style={{ maxWidth: props.contentMaxWidth || '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span style={{
            display: 'inline-block',
            fontSize: '12px',
            fontWeight: '700',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: props.accentColor,
            marginBottom: '12px',
          }}>
            {props.sectionTag}
          </span>
          <h2 style={{
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: '800',
            color: props.titleColor,
            lineHeight: '1.2',
            letterSpacing: '-0.5px',
            marginBottom: '16px',
          }}>
            {props.sectionTitle}
          </h2>
          <div style={{
            width: '60px',
            height: '4px',
            background: props.accentColor,
            borderRadius: '2px',
            margin: '0 auto 20px',
          }} />
          <p style={{
            fontSize: '17px',
            color: props.textColor,
            maxWidth: '600px',
            margin: '0 auto',
          }}>
            {props.sectionDescription}
          </p>
        </div>

        {/* Grid de cards */}
        <div
          className={`${scopeClass}-grid`}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
            justifyContent: 'center',
          }}
        >
          {props.segments.map((seg, i) => (
            <div key={i} className={`${scopeClass}-card`}>
              <div className={`${scopeClass}-icon`}>
                {seg.icon}
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: props.titleColor,
                marginBottom: '10px',
              }}>
                {seg.titulo}
              </h3>
              <p style={{
                fontSize: '14px',
                color: props.textColor,
                lineHeight: '1.6',
                margin: 0,
              }}>
                {seg.descricao}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

SegmentsComponent.craft = {
  displayName: 'Segmentos',
  props: defaultProps,
  rules: {
    canDrag: () => true,
    canMoveIn: () => false,
  },
  related: {
    settings: SegmentsSettings,
  },
}
