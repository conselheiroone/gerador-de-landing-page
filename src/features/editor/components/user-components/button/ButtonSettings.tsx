import { useNode } from '@craftjs/core'
import { ColorInput } from '../../ColorInput'

export const ButtonSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }))

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Texto</h4>
        <input
          type="text"
          value={props.text || ''}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.text = e.target.value })}
          className="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-gray-50"
        />
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Link</h4>
        <input
          type="text"
          value={props.href || ''}
          placeholder="https://..."
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.href = e.target.value })}
          className="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-gray-50"
        />
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Estilo</h4>
        <div className="flex gap-1">
          {(['filled', 'outline', 'ghost'] as const).map((style) => (
            <button
              key={style}
              onClick={() => setProp((p: Record<string, unknown>) => { p.buttonStyle = style })}
              className={`px-3 py-1 text-xs rounded capitalize ${
                props.buttonStyle === style
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {style === 'filled' ? 'Preenchido' : style === 'outline' ? 'Contorno' : 'Fantasma'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Tamanho</h4>
        <div className="flex gap-1">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <button
              key={size}
              onClick={() => setProp((p: Record<string, unknown>) => { p.size = size })}
              className={`px-3 py-1 text-xs rounded uppercase ${
                props.size === size
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Cores</h4>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Fundo</label>
            <ColorInput
              value={props.background || '#2563eb'}
              onChange={(v) => setProp((p: Record<string, unknown>) => { p.background = v })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Texto</label>
            <ColorInput
              value={props.color || '#ffffff'}
              onChange={(v) => setProp((p: Record<string, unknown>) => { p.color = v })}
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Border Radius</h4>
        <input
          type="range"
          min={0}
          max={50}
          value={props.borderRadius || 8}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.borderRadius = parseInt(e.target.value) }, 500)}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.borderRadius}px</span>
      </div>
    </div>
  )
}
