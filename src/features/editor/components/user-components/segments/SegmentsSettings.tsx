import { useNode } from '@craftjs/core'
import { ColorInput } from '../../ColorInput'
import type { SegmentsProps, SegmentItem } from './SegmentsComponent'

export function SegmentsSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as SegmentsProps }))

  return (
    <div className="space-y-4 p-2">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Tag da seção</label>
        <input
          type="text"
          value={props.sectionTag}
          onChange={(e) => setProp((p: SegmentsProps) => { p.sectionTag = e.target.value })}
          className="w-full text-sm border border-gray-200 rounded px-2 py-1"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Título</label>
        <input
          type="text"
          value={props.sectionTitle}
          onChange={(e) => setProp((p: SegmentsProps) => { p.sectionTitle = e.target.value })}
          className="w-full text-sm border border-gray-200 rounded px-2 py-1"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Descrição</label>
        <textarea
          value={props.sectionDescription}
          onChange={(e) => setProp((p: SegmentsProps) => { p.sectionDescription = e.target.value })}
          className="w-full text-sm border border-gray-200 rounded px-2 py-1"
          rows={2}
        />
      </div>

      <hr className="my-3" />

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Fundo</label>
        <ColorInput value={props.background} onChange={(v) => setProp((p: SegmentsProps) => { p.background = v })} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Fundo (gradiente para)</label>
        <ColorInput value={props.backgroundTo || '#ffffff'} onChange={(v) => setProp((p: SegmentsProps) => { p.backgroundTo = v })} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Cor primária</label>
        <ColorInput value={props.primaryColor} onChange={(v) => setProp((p: SegmentsProps) => { p.primaryColor = v })} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Cor de acento</label>
        <ColorInput value={props.accentColor} onChange={(v) => setProp((p: SegmentsProps) => { p.accentColor = v })} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Padding vertical (px)</label>
        <input
          type="range" min={40} max={120} step={4}
          value={props.paddingY}
          onChange={(e) => setProp((p: SegmentsProps) => { p.paddingY = Number(e.target.value) })}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.paddingY}px</span>
      </div>

      <hr className="my-3" />

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">Segmentos</label>
        {(props.segments || []).map((seg: SegmentItem, i: number) => (
          <div key={i} className="mb-3 p-2 bg-gray-50 rounded border border-gray-200">
            <div className="mb-1">
              <label className="block text-xs text-gray-400">Ícone (emoji)</label>
              <input
                type="text"
                value={seg.icon}
                onChange={(e) => setProp((p: SegmentsProps) => {
                  p.segments = [...p.segments]
                  p.segments[i] = { ...p.segments[i], icon: e.target.value }
                })}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1 mt-0.5"
              />
            </div>
            <div className="mb-1">
              <label className="block text-xs text-gray-400">Título</label>
              <input
                type="text"
                value={seg.titulo}
                onChange={(e) => setProp((p: SegmentsProps) => {
                  p.segments = [...p.segments]
                  p.segments[i] = { ...p.segments[i], titulo: e.target.value }
                })}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1 mt-0.5"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400">Descrição</label>
              <input
                type="text"
                value={seg.descricao}
                onChange={(e) => setProp((p: SegmentsProps) => {
                  p.segments = [...p.segments]
                  p.segments[i] = { ...p.segments[i], descricao: e.target.value }
                })}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1 mt-0.5"
              />
            </div>
          </div>
        ))}
        <button
          onClick={() => setProp((p: SegmentsProps) => {
            p.segments = [...p.segments, { icon: '📦', titulo: 'Novo Segmento', descricao: 'Descrição do segmento.' }]
          })}
          className="w-full text-xs text-blue-600 hover:text-blue-800 py-1"
        >
          + Adicionar segmento
        </button>
      </div>
    </div>
  )
}
