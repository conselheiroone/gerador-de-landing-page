import { useNode } from '@craftjs/core'
import { ColorInput } from '../../ColorInput'

export const CtaSectionSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }))

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Fundo</h4>
        <ColorInput
          value={props.background || '#2563eb'}
          onChange={(v) => setProp((p: Record<string, unknown>) => { p.background = v })}
        />
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Padding Vertical (px)</h4>
        <input
          type="range"
          min={20}
          max={100}
          value={props.paddingY || 50}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.paddingY = parseInt(e.target.value) }, 500)}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.paddingY}px</span>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Border Radius (px)</h4>
        <input
          type="range"
          min={0}
          max={30}
          value={props.radius || 12}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.radius = parseInt(e.target.value) }, 500)}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.radius}px</span>
      </div>
    </div>
  )
}
