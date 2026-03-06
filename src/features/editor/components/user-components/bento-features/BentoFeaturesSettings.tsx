import { useNode } from '@craftjs/core'
import { ColorInput } from '../../ColorInput'
import type { BentoFeaturesProps, BentoItem } from './BentoFeaturesComponent'

export function BentoFeaturesSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as BentoFeaturesProps }))

  return (
    <div className="space-y-4 p-2">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Fundo da seção</label>
        <ColorInput value={props.background} onChange={(v) => setProp((p: BentoFeaturesProps) => { p.background = v })} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Fundo dos cards</label>
        <ColorInput value={props.cardBackground} onChange={(v) => setProp((p: BentoFeaturesProps) => { p.cardBackground = v })} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Arredondamento dos cards (px)</label>
        <input
          type="range" min={0} max={32} step={4}
          value={props.cardRadius}
          onChange={(e) => setProp((p: BentoFeaturesProps) => { p.cardRadius = Number(e.target.value) })}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.cardRadius}px</span>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Padding vertical (px)</label>
        <input
          type="range" min={32} max={120} step={8}
          value={props.paddingY}
          onChange={(e) => setProp((p: BentoFeaturesProps) => { p.paddingY = Number(e.target.value) })}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.paddingY}px</span>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">Itens do bento</label>
        {(props.items || []).map((item: BentoItem, i: number) => (
          <div key={i} className="mb-3 p-2 bg-gray-50 rounded border border-gray-200 space-y-1.5">
            <div className="grid grid-cols-2 gap-1">
              <div>
                <label className="block text-xs text-gray-400">Ícone (emoji)</label>
                <input
                  type="text"
                  value={item.icon}
                  onChange={(e) => setProp((p: BentoFeaturesProps) => {
                    p.items = [...p.items]
                    p.items[i] = { ...p.items[i], icon: e.target.value }
                  })}
                  className="w-full text-sm border border-gray-200 rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400">Tamanho</label>
                <select
                  value={item.size}
                  onChange={(e) => setProp((p: BentoFeaturesProps) => {
                    p.items = [...p.items]
                    p.items[i] = { ...p.items[i], size: e.target.value as 'normal' | 'wide' }
                  })}
                  className="w-full text-sm border border-gray-200 rounded px-2 py-1"
                >
                  <option value="normal">Normal (1x1)</option>
                  <option value="wide">Largo (2x1)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400">Título</label>
              <input
                type="text"
                value={item.titulo}
                onChange={(e) => setProp((p: BentoFeaturesProps) => {
                  p.items = [...p.items]
                  p.items[i] = { ...p.items[i], titulo: e.target.value }
                })}
                className="w-full text-sm border border-gray-200 rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400">Cor de acento</label>
              <ColorInput
                value={item.accentColor}
                onChange={(v) => setProp((p: BentoFeaturesProps) => {
                  p.items = [...p.items]
                  p.items[i] = { ...p.items[i], accentColor: v }
                })}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
