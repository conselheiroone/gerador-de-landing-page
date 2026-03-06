import { useNode } from '@craftjs/core'
import { ColorInput } from '../../ColorInput'

export const HeadingSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }))

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Titulo</h4>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-400">Nivel</label>
            <div className="flex gap-1 mt-1">
              {(['h1', 'h2', 'h3', 'h4'] as const).map((tag) => (
                <button
                  key={tag}
                  onClick={() => setProp((p: Record<string, unknown>) => { p.tagName = tag })}
                  className={`px-3 py-1 text-xs rounded uppercase ${
                    props.tagName === tag
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400">Tamanho da Fonte (px)</label>
            <input
              type="range"
              min={14}
              max={96}
              value={parseInt(props.fontSize) || 32}
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
                { value: '600', label: 'Semi' },
                { value: '700', label: 'Bold' },
                { value: '800', label: 'Extra' },
              ] as const).map((w) => (
                <button
                  key={w.value}
                  onClick={() => setProp((p: Record<string, unknown>) => { p.fontWeight = w.value })}
                  className={`px-2 py-1 text-xs rounded ${
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
          value={props.color || '#111827'}
          onChange={(v) => setProp((p: Record<string, unknown>) => { p.color = v })}
        />
      </div>
    </div>
  )
}
