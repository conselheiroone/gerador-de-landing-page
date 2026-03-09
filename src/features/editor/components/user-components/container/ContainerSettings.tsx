import { useNode } from '@craftjs/core'
import { ColorInput } from '../../ColorInput'

export const ContainerSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }))

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Dimensoes</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-400">Largura</label>
            <input
              type="text"
              value={props.width || '100%'}
              onChange={(e) => setProp((p: Record<string, unknown>) => { p.width = e.target.value })}
              className="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-gray-50"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Altura</label>
            <input
              type="text"
              value={props.height || 'auto'}
              onChange={(e) => setProp((p: Record<string, unknown>) => { p.height = e.target.value })}
              className="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-gray-50"
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Cores</h4>
        <label className="text-xs text-gray-400 mb-1 block">Fundo</label>
        <ColorInput
          value={props.background || '#ffffff'}
          onChange={(v) => setProp((p: Record<string, unknown>) => { p.background = v })}
        />
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Espacamento</h4>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-400">Padding (px)</label>
            <input
              type="range"
              min={0}
              max={100}
              value={props.padding || 0}
              onChange={(e) => setProp((p: Record<string, unknown>) => { p.padding = parseInt(e.target.value) }, 500)}
              className="w-full"
            />
            <span className="text-xs text-gray-400">{props.padding}px</span>
          </div>
          <div>
            <label className="text-xs text-gray-400">Gap (px)</label>
            <input
              type="range"
              min={0}
              max={60}
              value={props.gap || 0}
              onChange={(e) => setProp((p: Record<string, unknown>) => { p.gap = parseInt(e.target.value) }, 500)}
              className="w-full"
            />
            <span className="text-xs text-gray-400">{props.gap}px</span>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Layout</h4>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-400">Direcao</label>
            <div className="flex gap-1 mt-1">
              {(['column', 'row'] as const).map((dir) => (
                <button
                  key={dir}
                  onClick={() => setProp((p: Record<string, unknown>) => { p.flexDirection = dir })}
                  className={`px-3 py-1 text-xs rounded ${
                    props.flexDirection === dir
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {dir === 'column' ? 'Coluna' : 'Linha'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400">Alinhar Itens</label>
            <div className="flex gap-1 mt-1">
              {(['flex-start', 'center', 'flex-end'] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => setProp((p: Record<string, unknown>) => { p.alignItems = align })}
                  className={`px-2 py-1 text-xs rounded ${
                    props.alignItems === align
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {align === 'flex-start' ? 'Início' : align === 'center' ? 'Centro' : 'Fim'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400">Justificar</label>
            <div className="flex gap-1 mt-1">
              {(['flex-start', 'center', 'flex-end', 'space-between'] as const).map((j) => (
                <button
                  key={j}
                  onClick={() => setProp((p: Record<string, unknown>) => { p.justifyContent = j })}
                  className={`px-2 py-1 text-xs rounded ${
                    props.justifyContent === j
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {j === 'flex-start' ? 'Início' : j === 'center' ? 'Centro' : j === 'flex-end' ? 'Fim' : 'Espaço'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Decoracao</h4>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-400">Border Radius (px)</label>
            <input
              type="range"
              min={0}
              max={50}
              value={props.radius || 0}
              onChange={(e) => setProp((p: Record<string, unknown>) => { p.radius = parseInt(e.target.value) }, 500)}
              className="w-full"
            />
            <span className="text-xs text-gray-400">{props.radius}px</span>
          </div>
          <div>
            <label className="text-xs text-gray-400">Sombra</label>
            <input
              type="range"
              min={0}
              max={50}
              value={props.shadow || 0}
              onChange={(e) => setProp((p: Record<string, unknown>) => { p.shadow = parseInt(e.target.value) }, 500)}
              className="w-full"
            />
            <span className="text-xs text-gray-400">{props.shadow}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
