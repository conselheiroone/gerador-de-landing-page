import { useNode } from '@craftjs/core'
import { ColorInput } from '../../ColorInput'

export const VideoSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }))

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">URL do Vídeo</h4>
        <input
          type="url"
          value={props.url || ''}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.url = e.target.value })}
          placeholder="https://youtube.com/watch?v=..."
          className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-blue-400"
        />
        <p className="mt-1 text-[10px] text-gray-400">
          Suporta YouTube e Vimeo
        </p>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Largura</h4>
        <input
          type="text"
          value={props.width || '100%'}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.width = e.target.value })}
          className="w-full text-xs border border-gray-200 rounded px-2 py-1.5"
          placeholder="100% ou 800px"
        />
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Altura</h4>
        <input
          type="text"
          value={props.height || '400px'}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.height = e.target.value })}
          className="w-full text-xs border border-gray-200 rounded px-2 py-1.5"
          placeholder="400px"
        />
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
          Arredondamento (px): {props.borderRadius ?? 12}
        </h4>
        <input
          type="range"
          min={0}
          max={32}
          value={props.borderRadius ?? 12}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.borderRadius = parseInt(e.target.value) }, 300)}
          className="w-full"
        />
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Fundo (placeholder)</h4>
        <ColorInput
          value={props.background || '#0f172a'}
          onChange={(v) => setProp((p: Record<string, unknown>) => { p.background = v })}
        />
      </div>
    </div>
  )
}
