import { useNode } from '@craftjs/core'
import { ColorInput } from '../../ColorInput'
import type { NavLink } from './NavbarComponent'

export const NavbarSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }))

  const links: NavLink[] = props.links ?? []

  const updateLink = (index: number, field: keyof NavLink, value: string) => {
    setProp((p: Record<string, unknown>) => {
      const updated = [...(p.links as NavLink[])]
      updated[index] = { ...updated[index], [field]: value }
      p.links = updated
    })
  }

  const addLink = () => {
    setProp((p: Record<string, unknown>) => {
      p.links = [...(p.links as NavLink[]), { label: 'Link', href: '#' }]
    })
  }

  const removeLink = (index: number) => {
    setProp((p: Record<string, unknown>) => {
      p.links = (p.links as NavLink[]).filter((_, i) => i !== index)
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Fundo da Navbar</h4>
        <ColorInput
          value={props.background || '#0f172a'}
          onChange={(v) => setProp((p: Record<string, unknown>) => { p.background = v })}
        />
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Logo</h4>
        <input
          type="text"
          value={props.logoText || ''}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.logoText = e.target.value })}
          placeholder="Texto do logo"
          className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 mb-1"
        />
        <input
          type="url"
          value={props.logoSrc || ''}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.logoSrc = e.target.value })}
          placeholder="URL da imagem do logo (opcional)"
          className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 mb-2"
        />
        <p className="text-[10px] text-gray-400 mb-1">Formato do Logo</p>
        <select
          value={props.logoShape || 'pill'}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.logoShape = e.target.value })}
          className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 mb-2"
        >
          <option value="pill">Retangular arredondado</option>
          <option value="circle">Circular (avatar)</option>
        </select>
        <label className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-2 cursor-pointer">
          <input
            type="checkbox"
            checked={props.showLogoText ?? false}
            onChange={(e) => setProp((p: Record<string, unknown>) => { p.showLogoText = e.target.checked })}
            className="rounded"
          />
          Mostrar nome ao lado do logo
        </label>
        <p className="text-[10px] text-gray-400 mb-1">Altura do Logo (px): {props.logoHeight || 44}</p>
        <input
          type="range"
          min={24}
          max={72}
          value={props.logoHeight ?? 44}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.logoHeight = parseInt(e.target.value) }, 300)}
          className="w-full mb-2"
        />
        <p className="text-[10px] text-gray-400 mb-1">Largura do Logo (px): {props.logoWidth || 'auto'}</p>
        <input
          type="range"
          min={0}
          max={200}
          value={props.logoWidth ?? 0}
          onChange={(e) => {
            const v = parseInt(e.target.value)
            setProp((p: Record<string, unknown>) => { p.logoWidth = v === 0 ? undefined : v }, 300)
          }}
          className="w-full mb-2"
        />
        <p className="text-[10px] text-gray-400 mb-1">Cor de Fundo do Logo</p>
        <ColorInput
          value={props.logoBg || 'transparent'}
          onChange={(v) => setProp((p: Record<string, unknown>) => { p.logoBg = v })}
        />
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Cor dos Links</h4>
        <ColorInput
          value={props.linkColor || '#ffffff'}
          onChange={(v) => setProp((p: Record<string, unknown>) => { p.linkColor = v })}
        />
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Links de Navegação</h4>
        <div className="space-y-2">
          {links.map((link, i) => (
            <div key={i} className="flex gap-1">
              <input
                type="text"
                value={link.label}
                onChange={(e) => updateLink(i, 'label', e.target.value)}
                placeholder="Label"
                className="flex-1 text-xs border border-gray-200 rounded px-2 py-1"
              />
              <input
                type="text"
                value={link.href}
                onChange={(e) => updateLink(i, 'href', e.target.value)}
                placeholder="href"
                className="flex-1 text-xs border border-gray-200 rounded px-2 py-1"
              />
              <button
                onClick={() => removeLink(i)}
                className="text-xs text-red-400 hover:text-red-600 px-1"
                title="Remover link"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={addLink}
            className="w-full text-xs text-blue-500 hover:text-blue-700 border border-dashed border-blue-200 rounded py-1.5 transition-colors"
          >
            + Adicionar link
          </button>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Botão CTA</h4>
        <input
          type="text"
          value={props.ctaText || ''}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.ctaText = e.target.value })}
          placeholder="Texto do botão"
          className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 mb-2"
        />
        <div className="space-y-2">
          <div>
            <p className="text-[10px] text-gray-400 mb-1">Fundo</p>
            <ColorInput value={props.ctaBg || '#f97316'} onChange={(v) => setProp((p: Record<string, unknown>) => { p.ctaBg = v })} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 mb-1">Texto</p>
            <ColorInput value={props.ctaColor || '#ffffff'} onChange={(v) => setProp((p: Record<string, unknown>) => { p.ctaColor = v })} />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
          Padding Vertical (px): {props.paddingY ?? 16}
        </h4>
        <input
          type="range"
          min={8}
          max={40}
          value={props.paddingY ?? 16}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.paddingY = parseInt(e.target.value) }, 300)}
          className="w-full"
        />
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
          Backdrop Blur (px): {props.backdropBlur ?? 0}
        </h4>
        <input
          type="range"
          min={0}
          max={24}
          value={props.backdropBlur ?? 0}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.backdropBlur = parseInt(e.target.value) }, 300)}
          className="w-full"
        />
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Borda Inferior</h4>
        <select
          value={props.borderBottom || 'none'}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.borderBottom = e.target.value })}
          className="w-full text-xs border border-gray-200 rounded px-2 py-1.5"
        >
          <option value="none">Nenhuma</option>
          <option value="1px solid rgba(255,255,255,0.08)">Sutil clara</option>
          <option value="1px solid rgba(255,255,255,0.15)">Média clara</option>
          <option value="1px solid rgba(0,0,0,0.1)">Sutil escura</option>
        </select>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
          Raio do Botão CTA (px): {props.ctaBorderRadius ?? 8}
        </h4>
        <input
          type="range"
          min={0}
          max={50}
          value={props.ctaBorderRadius ?? 8}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.ctaBorderRadius = parseInt(e.target.value) }, 300)}
          className="w-full"
        />
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
          Tamanho dos Links (px): {props.linkFontSize ?? 14}
        </h4>
        <input
          type="range"
          min={12}
          max={18}
          value={props.linkFontSize ?? 14}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.linkFontSize = parseInt(e.target.value) }, 300)}
          className="w-full"
        />
      </div>
    </div>
  )
}
