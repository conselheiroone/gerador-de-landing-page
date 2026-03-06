import { useNode } from '@craftjs/core'
import { ColorInput } from '../../ColorInput'
import type { SocialLinksProps, SocialLink } from './SocialLinksComponent'
import { SOCIAL_LABELS } from './SocialLinksComponent'

const PLATFORM_OPTIONS: SocialLink['platform'][] = ['instagram', 'facebook', 'linkedin', 'youtube', 'twitter', 'site']

export function SocialLinksSettings() {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as SocialLinksProps }))

  return (
    <div className="space-y-4 p-2">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Cor dos ícones</label>
        <ColorInput value={props.iconColor} onChange={(v) => setProp((p: SocialLinksProps) => { p.iconColor = v })} />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Tamanho (px)</label>
        <input
          type="range" min={16} max={40} step={2}
          value={props.iconSize}
          onChange={(e) => setProp((p: SocialLinksProps) => { p.iconSize = Number(e.target.value) })}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.iconSize}px</span>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Espaçamento (px)</label>
        <input
          type="range" min={8} max={32} step={4}
          value={props.gap}
          onChange={(e) => setProp((p: SocialLinksProps) => { p.gap = Number(e.target.value) })}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.gap}px</span>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Alinhamento</label>
        <select
          value={props.justifyContent}
          onChange={(e) => setProp((p: SocialLinksProps) => { p.justifyContent = e.target.value as SocialLinksProps['justifyContent'] })}
          className="w-full text-sm border border-gray-200 rounded px-2 py-1"
        >
          <option value="flex-start">Esquerda</option>
          <option value="center">Centro</option>
          <option value="flex-end">Direita</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">Links</label>
        {(props.links || []).map((link: SocialLink, i: number) => (
          <div key={i} className="mb-3 p-2 bg-gray-50 rounded border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <select
                value={link.platform}
                onChange={(e) => setProp((p: SocialLinksProps) => {
                  p.links = [...p.links]
                  p.links[i] = { ...p.links[i], platform: e.target.value as SocialLink['platform'] }
                })}
                className="text-sm border border-gray-200 rounded px-1 py-0.5 flex-1"
              >
                {PLATFORM_OPTIONS.map((p) => (
                  <option key={p} value={p}>{SOCIAL_LABELS[p]}</option>
                ))}
              </select>
              <button
                onClick={() => setProp((p: SocialLinksProps) => {
                  p.links = p.links.filter((_: SocialLink, idx: number) => idx !== i)
                })}
                className="text-xs text-red-400 hover:text-red-600"
              >
                Remover
              </button>
            </div>
            <input
              type="text"
              value={link.url}
              placeholder="https://..."
              onChange={(e) => setProp((p: SocialLinksProps) => {
                p.links = [...p.links]
                p.links[i] = { ...p.links[i], url: e.target.value }
              })}
              className="w-full text-sm border border-gray-200 rounded px-2 py-1"
            />
          </div>
        ))}
        <button
          onClick={() => setProp((p: SocialLinksProps) => {
            p.links = [...p.links, { platform: 'instagram', url: '#' }]
          })}
          className="text-xs text-blue-500 hover:text-blue-700"
        >
          + Adicionar rede
        </button>
      </div>
    </div>
  )
}
