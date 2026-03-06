import { useNode } from '@craftjs/core'
import { ColorInput } from '../../ColorInput'

export const TextSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }))

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Tipografia</h4>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-400">Tamanho da Fonte (px)</label>
            <input
              type="range"
              min={8}
              max={80}
              value={parseInt(props.fontSize) || 16}
              onChange={(e) => setProp((p: Record<string, unknown>) => { p.fontSize = `${e.target.value}` }, 500)}
              className="w-full"
            />
            <span className="text-xs text-gray-400">{props.fontSize}px</span>
          </div>
          <div>
            <label className="text-xs text-gray-400">Alinhamento</label>
            <div className="flex gap-1 mt-1">
              {(['left', 'center', 'right'] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => setProp((p: Record<string, unknown>) => { p.textAlign = align })}
                  className={`px-3 py-1 text-xs rounded ${
                    props.textAlign === align
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {align === 'left' ? 'Esquerda' : align === 'center' ? 'Centro' : 'Direita'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400">Peso</label>
            <div className="flex gap-1 mt-1">
              {([
                { value: '400', label: 'Normal' },
                { value: '500', label: 'Medio' },
                { value: '700', label: 'Negrito' },
              ] as const).map((w) => (
                <button
                  key={w.value}
                  onClick={() => setProp((p: Record<string, unknown>) => { p.fontWeight = w.value })}
                  className={`px-3 py-1 text-xs rounded ${
                    props.fontWeight === w.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Cor</h4>
        <ColorInput
          value={props.color || '#333333'}
          onChange={(v) => setProp((p: Record<string, unknown>) => { p.color = v })}
        />
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Margem</h4>
        <div className="grid grid-cols-2 gap-2">
          {(['Top', 'Right', 'Bottom', 'Left'] as const).map((side, i) => (
            <div key={side}>
              <label className="text-xs text-gray-400">{side}</label>
              <input
                type="number"
                min={0}
                max={100}
                value={props.margin?.[i] || 0}
                onChange={(e) =>
                  setProp((p: Record<string, unknown>) => {
                    const m = [...(p.margin as number[] || [0, 0, 0, 0])]
                    m[i] = parseInt(e.target.value) || 0
                    p.margin = m
                  }, 500)
                }
                className="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-gray-50"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
