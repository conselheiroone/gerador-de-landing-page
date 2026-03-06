import { useNode } from '@craftjs/core'
import { ColorInput } from '../../ColorInput'
import type { QuoteHighlightProps } from './QuoteHighlightComponent'

export function QuoteHighlightSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as QuoteHighlightProps }))

  return (
    <div className="space-y-4 p-2">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Citação</label>
        <textarea
          value={props.quote}
          rows={3}
          onChange={(e) => setProp((p: QuoteHighlightProps) => { p.quote = e.target.value })}
          className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 resize-none"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Autor</label>
        <input
          type="text"
          value={props.author}
          onChange={(e) => setProp((p: QuoteHighlightProps) => { p.author = e.target.value })}
          className="w-full text-sm border border-gray-200 rounded px-2 py-1"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Cargo / Empresa</label>
        <input
          type="text"
          value={props.role}
          onChange={(e) => setProp((p: QuoteHighlightProps) => { p.role = e.target.value })}
          className="w-full text-sm border border-gray-200 rounded px-2 py-1"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Fundo</label>
        <ColorInput value={props.background} onChange={(v) => setProp((p: QuoteHighlightProps) => { p.background = v })} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Cor do texto</label>
        <ColorInput value={props.textColor} onChange={(v) => setProp((p: QuoteHighlightProps) => { p.textColor = v })} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Cor de acento</label>
        <ColorInput value={props.accentColor} onChange={(v) => setProp((p: QuoteHighlightProps) => { p.accentColor = v })} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Padding vertical (px)</label>
        <input
          type="range" min={40} max={120} step={8}
          value={props.paddingY}
          onChange={(e) => setProp((p: QuoteHighlightProps) => { p.paddingY = Number(e.target.value) })}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.paddingY}px</span>
      </div>
    </div>
  )
}
