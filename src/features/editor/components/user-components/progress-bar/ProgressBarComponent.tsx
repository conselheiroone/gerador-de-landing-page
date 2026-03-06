import { useNode, type UserComponent } from '@craftjs/core'
import { ColorInput } from '../../ColorInput'

export type ProgressBarProps = {
  label: string
  percentage: number
  barColor: string
  trackColor: string
  textColor: string
  height: number
  borderRadius: number
  showPercentage: boolean
  fontSize: number
  animated: boolean
}

const defaultProps: ProgressBarProps = {
  label: 'Progresso',
  percentage: 75,
  barColor: '#2563eb',
  trackColor: '#e5e7eb',
  textColor: '#374151',
  height: 12,
  borderRadius: 50,
  showPercentage: true,
  fontSize: 14,
  animated: true,
}

const ProgressBarSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-gray-400">Label</label>
        <input
          type="text"
          value={props.label || ''}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.label = e.target.value })}
          placeholder="Progresso"
          className="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-gray-50"
        />
      </div>

      <div>
        <label className="text-xs text-gray-400">Porcentagem ({props.percentage}%)</label>
        <input
          type="range" min={0} max={100}
          value={props.percentage || 75}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.percentage = parseInt(e.target.value) }, 500)}
          className="w-full"
        />
      </div>

      <div>
        <label className="text-xs text-gray-400">Altura da Barra (px)</label>
        <input
          type="range" min={4} max={32}
          value={props.height || 12}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.height = parseInt(e.target.value) }, 500)}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.height}px</span>
      </div>

      <div>
        <label className="text-xs text-gray-400">Borda (px)</label>
        <input
          type="range" min={0} max={50}
          value={props.borderRadius || 50}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.borderRadius = parseInt(e.target.value) }, 500)}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.borderRadius}px</span>
      </div>

      <div>
        <label className="text-xs text-gray-400">Tamanho do Texto</label>
        <input
          type="range" min={10} max={18}
          value={props.fontSize || 14}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.fontSize = parseInt(e.target.value) }, 500)}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.fontSize}px</span>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={props.showPercentage ?? true}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.showPercentage = e.target.checked })}
        />
        <span className="text-xs text-gray-600">Mostrar porcentagem</span>
      </label>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Cores</h4>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-400">Barra</label>
            <ColorInput
              value={props.barColor || '#2563eb'}
              onChange={(v) => setProp((p: Record<string, unknown>) => { p.barColor = v })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Fundo da Barra</label>
            <ColorInput
              value={props.trackColor || '#e5e7eb'}
              onChange={(v) => setProp((p: Record<string, unknown>) => { p.trackColor = v })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Texto</label>
            <ColorInput
              value={props.textColor || '#374151'}
              onChange={(v) => setProp((p: Record<string, unknown>) => { p.textColor = v })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export const ProgressBarComponent: UserComponent<Partial<ProgressBarProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const { connectors: { connect } } = useNode()

  const {
    label, percentage, barColor, trackColor, textColor,
    height, borderRadius, showPercentage, fontSize,
  } = props

  return (
    <div
      ref={(ref) => { if (ref) connect(ref) }}
      style={{ width: '100%' }}
    >
      {(label || showPercentage) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}
        >
          {label && (
            <span style={{ fontSize: `${fontSize}px`, fontWeight: 600, color: textColor }}>
              {label}
            </span>
          )}
          {showPercentage && (
            <span style={{ fontSize: `${fontSize - 1}px`, fontWeight: 600, color: barColor }}>
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: `${height}px`,
          backgroundColor: trackColor,
          borderRadius: `${borderRadius}px`,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${Math.min(percentage, 100)}%`,
            height: '100%',
            backgroundColor: barColor,
            borderRadius: `${borderRadius}px`,
            transition: 'width 0.6s ease',
          }}
        />
      </div>
    </div>
  )
}

ProgressBarComponent.craft = {
  displayName: 'Progresso',
  props: defaultProps,
  rules: {
    canMoveIn: () => false,
  },
  related: {
    settings: ProgressBarSettings,
  },
}
