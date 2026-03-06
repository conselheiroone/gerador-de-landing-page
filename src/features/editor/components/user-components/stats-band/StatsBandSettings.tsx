import { useNode } from '@craftjs/core'
import { ColorInput } from '../../ColorInput'
import type { StatsBandProps, StatItem } from './StatsBandComponent'

export function StatsBandSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as StatsBandProps }))

  return (
    <div className="space-y-4 p-2">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Fundo</label>
        <ColorInput value={props.background} onChange={(v) => setProp((p: StatsBandProps) => { p.background = v })} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Cor de acento (valores)</label>
        <ColorInput value={props.accentColor} onChange={(v) => setProp((p: StatsBandProps) => { p.accentColor = v })} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Cor dos labels</label>
        <ColorInput value={props.labelColor} onChange={(v) => setProp((p: StatsBandProps) => { p.labelColor = v })} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Padding vertical (px)</label>
        <input
          type="range" min={24} max={80} step={4}
          value={props.paddingY}
          onChange={(e) => setProp((p: StatsBandProps) => { p.paddingY = Number(e.target.value) })}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.paddingY}px</span>
      </div>
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={props.showDivider}
            onChange={(e) => setProp((p: StatsBandProps) => { p.showDivider = e.target.checked })}
          />
          <span className="text-xs text-gray-600">Separadores entre colunas</span>
        </label>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">Estatísticas</label>
        {(props.stats || []).map((stat: StatItem, i: number) => (
          <div key={i} className="mb-3 p-2 bg-gray-50 rounded border border-gray-200">
            <div className="mb-1">
              <label className="block text-xs text-gray-400">Valor</label>
              <input
                type="text"
                value={stat.valor}
                onChange={(e) => setProp((p: StatsBandProps) => {
                  p.stats = [...p.stats]
                  p.stats[i] = { ...p.stats[i], valor: e.target.value }
                })}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1 mt-0.5"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400">Label</label>
              <input
                type="text"
                value={stat.label}
                onChange={(e) => setProp((p: StatsBandProps) => {
                  p.stats = [...p.stats]
                  p.stats[i] = { ...p.stats[i], label: e.target.value }
                })}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1 mt-0.5"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
