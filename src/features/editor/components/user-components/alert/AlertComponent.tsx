import { useNode, type UserComponent } from '@craftjs/core'
import { ColorInput } from '../../ColorInput'
import { Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

export type AlertVariant = 'info' | 'success' | 'warning' | 'error'

export type AlertProps = {
  text: string
  title: string
  variant: AlertVariant
  showIcon: boolean
  borderStyle: 'left' | 'full' | 'none'
  backgroundColor: string
  textColor: string
  iconColor: string
  borderColor: string
  fontSize: number
}

const VARIANT_DEFAULTS: Record<AlertVariant, { bg: string; text: string; icon: string; border: string }> = {
  info:    { bg: '#eff6ff', text: '#1e40af', icon: '#3b82f6', border: '#3b82f6' },
  success: { bg: '#f0fdf4', text: '#166534', icon: '#22c55e', border: '#22c55e' },
  warning: { bg: '#fffbeb', text: '#92400e', icon: '#f59e0b', border: '#f59e0b' },
  error:   { bg: '#fef2f2', text: '#991b1b', icon: '#ef4444', border: '#ef4444' },
}

const VARIANT_ICONS: Record<AlertVariant, React.ComponentType<{ size?: number }>> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
}

const defaultProps: AlertProps = {
  text: 'Esta é uma mensagem informativa para o visitante.',
  title: '',
  variant: 'info',
  showIcon: true,
  borderStyle: 'left',
  backgroundColor: VARIANT_DEFAULTS.info.bg,
  textColor: VARIANT_DEFAULTS.info.text,
  iconColor: VARIANT_DEFAULTS.info.icon,
  borderColor: VARIANT_DEFAULTS.info.border,
  fontSize: 14,
}

const AlertSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }))

  const applyVariant = (v: AlertVariant) => {
    const d = VARIANT_DEFAULTS[v]
    setProp((p: Record<string, unknown>) => {
      p.variant = v
      p.backgroundColor = d.bg
      p.textColor = d.text
      p.iconColor = d.icon
      p.borderColor = d.border
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Tipo</h4>
        <div className="flex gap-1">
          {(['info', 'success', 'warning', 'error'] as const).map((v) => (
            <button
              key={v}
              onClick={() => applyVariant(v)}
              className={`px-2 py-1 text-xs rounded ${
                props.variant === v
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {v === 'info' ? 'Info' : v === 'success' ? 'Sucesso' : v === 'warning' ? 'Aviso' : 'Erro'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400">Título (opcional)</label>
        <input
          type="text"
          value={props.title || ''}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.title = e.target.value })}
          placeholder="Título do alerta"
          className="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-gray-50"
        />
      </div>

      <div>
        <label className="text-xs text-gray-400">Texto</label>
        <textarea
          value={props.text || ''}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.text = e.target.value })}
          rows={3}
          className="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-gray-50 resize-none"
        />
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Borda</h4>
        <div className="flex gap-1">
          {(['left', 'full', 'none'] as const).map((b) => (
            <button
              key={b}
              onClick={() => setProp((p: Record<string, unknown>) => { p.borderStyle = b })}
              className={`px-3 py-1 text-xs rounded ${
                props.borderStyle === b
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {b === 'left' ? 'Esquerda' : b === 'full' ? 'Completa' : 'Nenhuma'}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={props.showIcon ?? true}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.showIcon = e.target.checked })}
        />
        <span className="text-xs text-gray-600">Mostrar ícone</span>
      </label>

      <div>
        <label className="text-xs text-gray-400">Tamanho do Texto</label>
        <input
          type="range" min={12} max={18}
          value={props.fontSize || 14}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.fontSize = parseInt(e.target.value) }, 500)}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.fontSize}px</span>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Cores</h4>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-400">Fundo</label>
            <ColorInput
              value={props.backgroundColor || '#eff6ff'}
              onChange={(v) => setProp((p: Record<string, unknown>) => { p.backgroundColor = v })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Texto</label>
            <ColorInput
              value={props.textColor || '#1e40af'}
              onChange={(v) => setProp((p: Record<string, unknown>) => { p.textColor = v })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Borda/Ícone</label>
            <ColorInput
              value={props.borderColor || '#3b82f6'}
              onChange={(v) => setProp((p: Record<string, unknown>) => { p.borderColor = v; p.iconColor = v })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export const AlertComponent: UserComponent<Partial<AlertProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const { connectors: { connect } } = useNode()

  const {
    text, title, variant, showIcon, borderStyle,
    backgroundColor, textColor, iconColor, borderColor, fontSize,
  } = props

  const Icon = VARIANT_ICONS[variant] || Info

  const borderCss: React.CSSProperties =
    borderStyle === 'left'
      ? { borderLeft: `4px solid ${borderColor}` }
      : borderStyle === 'full'
        ? { border: `1px solid ${borderColor}` }
        : {}

  return (
    <div
      ref={(ref) => { if (ref) connect(ref) }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '16px',
        backgroundColor,
        borderRadius: '8px',
        width: '100%',
        ...borderCss,
      }}
    >
      {showIcon && (
        <span style={{ color: iconColor, flexShrink: 0, marginTop: '1px' }}>
          <Icon size={20} />
        </span>
      )}
      <div style={{ flex: 1 }}>
        {title && (
          <div
            style={{
              fontSize: `${fontSize + 1}px`,
              fontWeight: 700,
              color: textColor,
              marginBottom: '4px',
            }}
          >
            {title}
          </div>
        )}
        <div
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: '1.5',
            color: textColor,
          }}
        >
          {text}
        </div>
      </div>
    </div>
  )
}

AlertComponent.craft = {
  displayName: 'Alerta',
  props: defaultProps,
  rules: {
    canMoveIn: () => false,
  },
  related: {
    settings: AlertSettings,
  },
}
