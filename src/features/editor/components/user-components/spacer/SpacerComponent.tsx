import { useNode, useEditor, type UserComponent } from '@craftjs/core'

export type SpacerProps = {
  height: number
}

const defaultProps: SpacerProps = {
  height: 40,
}

const SpacerSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-gray-400">Altura (px)</label>
        <input
          type="range"
          min={10}
          max={200}
          value={props.height || 40}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.height = parseInt(e.target.value) }, 500)}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.height}px</span>
      </div>
      <div className="flex gap-1 flex-wrap">
        {[20, 40, 60, 80, 120].map((h) => (
          <button
            key={h}
            onClick={() => setProp((p: Record<string, unknown>) => { p.height = h })}
            className={`px-2 py-1 text-xs rounded ${
              props.height === h
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {h}px
          </button>
        ))}
      </div>
    </div>
  )
}

export const SpacerComponent: UserComponent<Partial<SpacerProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const { connectors: { connect } } = useNode()
  const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }))

  return (
    <div
      ref={(ref) => { if (ref) connect(ref) }}
      style={{
        width: '100%',
        height: `${props.height}px`,
        position: 'relative',
      }}
    >
      {enabled && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderTop: '1px dashed #d1d5db',
            borderBottom: '1px dashed #d1d5db',
          }}
        >
          <span
            style={{
              fontSize: '10px',
              color: '#9ca3af',
              backgroundColor: '#f9fafb',
              padding: '0 6px',
              borderRadius: '4px',
            }}
          >
            {props.height}px
          </span>
        </div>
      )}
    </div>
  )
}

SpacerComponent.craft = {
  displayName: 'Espaçador',
  props: defaultProps,
  rules: {
    canMoveIn: () => false,
  },
  related: {
    settings: SpacerSettings,
  },
}
