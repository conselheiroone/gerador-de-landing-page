import { useNode, type UserComponent } from '@craftjs/core'
import { ColorInput } from '../../ColorInput'

export type DividerProps = {
  color: string
  thickness: number
  marginY: number
  style: 'solid' | 'dashed' | 'dotted'
}

const defaultProps: DividerProps = {
  color: '#e5e7eb',
  thickness: 1,
  marginY: 20,
  style: 'solid',
}

const DividerSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }))

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Cor</h4>
        <ColorInput
          value={props.color || '#e5e7eb'}
          onChange={(v) => setProp((p: Record<string, unknown>) => { p.color = v })}
        />
      </div>
      <div>
        <label className="text-xs text-gray-400">Espessura (px)</label>
        <input
          type="range"
          min={1}
          max={10}
          value={props.thickness || 1}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.thickness = parseInt(e.target.value) }, 500)}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.thickness}px</span>
      </div>
      <div>
        <label className="text-xs text-gray-400">Margem Vertical (px)</label>
        <input
          type="range"
          min={0}
          max={60}
          value={props.marginY || 20}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.marginY = parseInt(e.target.value) }, 500)}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.marginY}px</span>
      </div>
      <div>
        <label className="text-xs text-gray-400">Estilo</label>
        <div className="flex gap-1 mt-1">
          {(['solid', 'dashed', 'dotted'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setProp((p: Record<string, unknown>) => { p.style = s })}
              className={`px-3 py-1 text-xs rounded capitalize ${
                props.style === s
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'solid' ? 'Solido' : s === 'dashed' ? 'Tracejado' : 'Pontilhado'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export const DividerComponent: UserComponent<Partial<DividerProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const {
    connectors: { connect },
  } = useNode()

  return (
    <hr
      ref={(ref) => { if (ref) connect(ref) }}
      style={{
        width: '100%',
        border: 'none',
        borderTop: `${props.thickness}px ${props.style} ${props.color}`,
        margin: `${props.marginY}px 0`,
      }}
    />
  )
}

DividerComponent.craft = {
  displayName: 'Divisor',
  props: defaultProps,
  related: {
    settings: DividerSettings,
  },
}
