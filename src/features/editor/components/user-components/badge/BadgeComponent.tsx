import { useNode, type UserComponent } from '@craftjs/core'
import { ColorInput } from '../../ColorInput'

export type BadgeStyle = 'filled' | 'outlined' | 'soft'

export type BadgeProps = {
  text: string
  badgeStyle: BadgeStyle
  color: string
  backgroundColor: string
  fontSize: number
  borderRadius: number
  paddingX: number
  paddingY: number
  fontWeight: number
  textTransform: 'none' | 'uppercase' | 'capitalize'
  letterSpacing: number
  /** Borda customizada (ex: '1px solid rgba(255,255,255,0.1)') */
  border?: string
  /** Backdrop filter (ex: 'blur(10px)') */
  backdropFilter?: string
  /** Margem inferior em px */
  marginBottom?: number
}

const defaultProps: BadgeProps = {
  text: 'Destaque',
  badgeStyle: 'soft',
  color: '#2563eb',
  backgroundColor: '#eff6ff',
  fontSize: 12,
  borderRadius: 50,
  paddingX: 14,
  paddingY: 5,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
}

const PRESET_COLORS = [
  { label: 'Azul', color: '#2563eb', bg: '#eff6ff' },
  { label: 'Verde', color: '#16a34a', bg: '#f0fdf4' },
  { label: 'Vermelho', color: '#dc2626', bg: '#fef2f2' },
  { label: 'Amarelo', color: '#ca8a04', bg: '#fefce8' },
  { label: 'Roxo', color: '#9333ea', bg: '#faf5ff' },
  { label: 'Cinza', color: '#4b5563', bg: '#f3f4f6' },
]

const BadgeSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-gray-400">Texto</label>
        <input
          type="text"
          value={props.text || 'Destaque'}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.text = e.target.value })}
          className="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-gray-50"
        />
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Estilo</h4>
        <div className="flex gap-1">
          {(['filled', 'outlined', 'soft'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setProp((p: Record<string, unknown>) => { p.badgeStyle = s })}
              className={`px-3 py-1 text-xs rounded ${
                props.badgeStyle === s
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'filled' ? 'Sólido' : s === 'outlined' ? 'Contorno' : 'Suave'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Presets</h4>
        <div className="flex flex-wrap gap-1">
          {PRESET_COLORS.map((p) => (
            <button
              key={p.label}
              onClick={() =>
                setProp((pr: Record<string, unknown>) => {
                  pr.color = p.color
                  pr.backgroundColor = p.bg
                })
              }
              className="flex items-center gap-1.5 px-2 py-1 text-xs rounded border border-gray-200 hover:border-gray-300"
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: p.color }}
              />
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Texto</h4>
        <div className="flex gap-1 mb-2">
          {(['none', 'uppercase', 'capitalize'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setProp((p: Record<string, unknown>) => { p.textTransform = t })}
              className={`px-2 py-1 text-xs rounded ${
                props.textTransform === t
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t === 'none' ? 'Normal' : t === 'uppercase' ? 'MAIÚSCULA' : 'Capitalizar'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400">Tamanho da Fonte</label>
        <input
          type="range" min={9} max={18}
          value={props.fontSize || 12}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.fontSize = parseInt(e.target.value) }, 500)}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.fontSize}px</span>
      </div>

      <div>
        <label className="text-xs text-gray-400">Arredondamento</label>
        <input
          type="range" min={0} max={50}
          value={props.borderRadius || 50}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.borderRadius = parseInt(e.target.value) }, 500)}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.borderRadius}px</span>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Cores</h4>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-400">Cor</label>
            <ColorInput
              value={props.color || '#2563eb'}
              onChange={(v) => setProp((p: Record<string, unknown>) => { p.color = v })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Fundo</label>
            <ColorInput
              value={props.backgroundColor || '#eff6ff'}
              onChange={(v) => setProp((p: Record<string, unknown>) => { p.backgroundColor = v })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export const BadgeComponent: UserComponent<Partial<BadgeProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const { connectors: { connect } } = useNode()

  const {
    text, badgeStyle, color, backgroundColor, fontSize,
    borderRadius, paddingX, paddingY, fontWeight, textTransform, letterSpacing,
    border, backdropFilter, marginBottom,
  } = props

  const style: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: `${fontSize}px`,
    fontWeight,
    borderRadius: `${borderRadius}px`,
    padding: `${paddingY}px ${paddingX}px`,
    textTransform,
    letterSpacing: `${letterSpacing}px`,
    lineHeight: 1.3,
    whiteSpace: 'nowrap',
    marginBottom: marginBottom ? `${marginBottom}px` : undefined,
    backdropFilter: backdropFilter || undefined,
    WebkitBackdropFilter: backdropFilter || undefined,
  }

  if (badgeStyle === 'filled') {
    style.backgroundColor = color
    style.color = '#ffffff'
    // Se há borda customizada, usa ela
    if (border) {
      style.border = border
    }
  } else if (badgeStyle === 'outlined') {
    style.backgroundColor = 'transparent'
    style.color = color
    style.border = border || `1.5px solid ${color}`
  } else {
    // soft
    style.backgroundColor = backgroundColor
    style.color = color
    if (border) {
      style.border = border
    }
  }

  return (
    <span
      ref={(ref) => { if (ref) connect(ref) }}
      style={style}
    >
      {text}
    </span>
  )
}

BadgeComponent.craft = {
  displayName: 'Etiqueta',
  props: defaultProps,
  rules: {
    canMoveIn: () => false,
  },
  related: {
    settings: BadgeSettings,
  },
}
