import { useNode } from '@craftjs/core'
import { ColorInput } from '../../ColorInput'

export const FooterSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }))

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Fundo</h4>
        <ColorInput
          value={props.background || '#111827'}
          onChange={(v) => setProp((p: Record<string, unknown>) => { p.background = v })}
        />
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Padding Vertical (px)</h4>
        <input
          type="range"
          min={20}
          max={80}
          value={props.paddingY || 40}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.paddingY = parseInt(e.target.value) }, 500)}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.paddingY}px</span>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Colunas</h4>
        <div className="flex gap-1">
          {([1, 2, 3, 4] as const).map((cols) => (
            <button
              key={cols}
              onClick={() => setProp((p: Record<string, unknown>) => { p.columns = cols })}
              className={`px-3 py-1 text-xs rounded ${
                props.columns === cols
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cols}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
