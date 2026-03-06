import { useNode, type UserComponent } from '@craftjs/core'
import { ColorInput } from '../../ColorInput'

export type NumberCounterProps = {
  value: string
  label: string
  prefix: string
  suffix: string
  fontSize: number
  labelSize: number
  color: string
  labelColor: string
  fontWeight: number
  textAlign: 'left' | 'center' | 'right'
}

const defaultProps: NumberCounterProps = {
  value: '500',
  label: 'Clientes Atendidos',
  prefix: '',
  suffix: '+',
  fontSize: 48,
  labelSize: 14,
  color: '#2563eb',
  labelColor: '#6b7280',
  fontWeight: 900,
  textAlign: 'center',
}

const NumberCounterSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-gray-400">Valor</label>
        <input
          type="text"
          value={props.value || '500'}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.value = e.target.value })}
          placeholder="500"
          className="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-gray-50"
        />
      </div>

      <div>
        <label className="text-xs text-gray-400">Label</label>
        <input
          type="text"
          value={props.label || ''}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.label = e.target.value })}
          placeholder="Clientes Atendidos"
          className="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-gray-50"
        />
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-xs text-gray-400">Prefixo</label>
          <input
            type="text"
            value={props.prefix || ''}
            onChange={(e) => setProp((p: Record<string, unknown>) => { p.prefix = e.target.value })}
            placeholder="R$"
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-gray-50"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-400">Sufixo</label>
          <input
            type="text"
            value={props.suffix || ''}
            onChange={(e) => setProp((p: Record<string, unknown>) => { p.suffix = e.target.value })}
            placeholder="+"
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-gray-50"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400">Tamanho do Número</label>
        <input
          type="range" min={24} max={80}
          value={props.fontSize || 48}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.fontSize = parseInt(e.target.value) }, 500)}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.fontSize}px</span>
      </div>

      <div>
        <label className="text-xs text-gray-400">Tamanho do Label</label>
        <input
          type="range" min={10} max={20}
          value={props.labelSize || 14}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.labelSize = parseInt(e.target.value) }, 500)}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.labelSize}px</span>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Alinhamento</h4>
        <div className="flex gap-1">
          {(['left', 'center', 'right'] as const).map((a) => (
            <button
              key={a}
              onClick={() => setProp((p: Record<string, unknown>) => { p.textAlign = a })}
              className={`px-3 py-1 text-xs rounded ${
                props.textAlign === a
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {a === 'left' ? 'Esquerda' : a === 'center' ? 'Centro' : 'Direita'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Cores</h4>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-400">Número</label>
            <ColorInput
              value={props.color || '#2563eb'}
              onChange={(v) => setProp((p: Record<string, unknown>) => { p.color = v })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Label</label>
            <ColorInput
              value={props.labelColor || '#6b7280'}
              onChange={(v) => setProp((p: Record<string, unknown>) => { p.labelColor = v })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export const NumberCounterComponent: UserComponent<Partial<NumberCounterProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const { connectors: { connect } } = useNode()

  const { value, label, prefix, suffix, fontSize, labelSize, color, labelColor, fontWeight, textAlign } = props

  return (
    <div
      ref={(ref) => { if (ref) connect(ref) }}
      style={{
        textAlign,
        width: '100%',
      }}
    >
      <div
        style={{
          fontSize: `${fontSize}px`,
          fontWeight,
          color,
          lineHeight: 1.1,
        }}
      >
        {prefix}{value}{suffix}
      </div>
      {label && (
        <div
          style={{
            fontSize: `${labelSize}px`,
            color: labelColor,
            marginTop: '6px',
            fontWeight: 500,
            letterSpacing: '0.02em',
          }}
        >
          {label}
        </div>
      )}
    </div>
  )
}

NumberCounterComponent.craft = {
  displayName: 'Contador',
  props: defaultProps,
  rules: {
    canMoveIn: () => false,
  },
  related: {
    settings: NumberCounterSettings,
  },
}
