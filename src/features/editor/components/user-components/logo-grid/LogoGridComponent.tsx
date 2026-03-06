import { useNode, type UserComponent } from '@craftjs/core'
import { ColorInput } from '../../ColorInput'
import { Trash2, Plus } from 'lucide-react'

type LogoItem = {
  src: string
  alt: string
  href: string
}

export type LogoGridProps = {
  logos: LogoItem[]
  columns: number
  gap: number
  logoHeight: number
  grayscale: boolean
  opacity: number
  hoverEffect: boolean
  background: string
  padding: number
  title: string
  titleColor: string
  titleSize: number
}

const defaultProps: LogoGridProps = {
  logos: [
    { src: 'https://placehold.co/160x60/f1f5f9/64748b?text=Logo+1', alt: 'Cliente 1', href: '' },
    { src: 'https://placehold.co/160x60/f1f5f9/64748b?text=Logo+2', alt: 'Cliente 2', href: '' },
    { src: 'https://placehold.co/160x60/f1f5f9/64748b?text=Logo+3', alt: 'Cliente 3', href: '' },
    { src: 'https://placehold.co/160x60/f1f5f9/64748b?text=Logo+4', alt: 'Cliente 4', href: '' },
    { src: 'https://placehold.co/160x60/f1f5f9/64748b?text=Logo+5', alt: 'Cliente 5', href: '' },
  ],
  columns: 5,
  gap: 24,
  logoHeight: 40,
  grayscale: true,
  opacity: 0.6,
  hoverEffect: true,
  background: 'transparent',
  padding: 24,
  title: 'Empresas que Confiam em Nós',
  titleColor: '#9ca3af',
  titleSize: 13,
}

const LogoGridSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }))
  const logos: LogoItem[] = props.logos || defaultProps.logos

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-gray-400">Título</label>
        <input
          type="text" value={props.title || ''}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.title = e.target.value })}
          className="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-gray-50"
        />
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Logos ({logos.length})</h4>
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {logos.map((logo, i) => (
            <div key={i} className="flex items-center gap-1">
              <input
                type="text" value={logo.src}
                onChange={(e) =>
                  setProp((p: Record<string, unknown>) => {
                    const arr = [...(p.logos as LogoItem[])]
                    arr[i] = { ...arr[i], src: e.target.value }
                    p.logos = arr
                  })
                }
                placeholder="URL do logo"
                className="flex-1 px-1.5 py-0.5 text-[10px] border border-gray-200 rounded bg-white"
              />
              {logos.length > 1 && (
                <button
                  onClick={() =>
                    setProp((p: Record<string, unknown>) => {
                      const arr = [...(p.logos as LogoItem[])]
                      arr.splice(i, 1)
                      p.logos = arr
                    })
                  }
                  className="p-0.5 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={() =>
            setProp((p: Record<string, unknown>) => {
              const arr = [...(p.logos as LogoItem[])]
              const n = arr.length + 1
              arr.push({ src: `https://placehold.co/160x60/f1f5f9/64748b?text=Logo+${n}`, alt: `Cliente ${n}`, href: '' })
              p.logos = arr
            })
          }
          className="mt-2 w-full flex items-center justify-center gap-1 py-1.5 text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100"
        >
          <Plus className="h-3 w-3" />
          Adicionar Logo
        </button>
      </div>

      <div>
        <label className="text-xs text-gray-400">Colunas</label>
        <div className="flex gap-1">
          {[3, 4, 5, 6].map((c) => (
            <button key={c}
              onClick={() => setProp((p: Record<string, unknown>) => { p.columns = c })}
              className={`px-3 py-1 text-xs rounded ${props.columns === c ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >{c}</button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400">Altura do Logo (px)</label>
        <input type="range" min={20} max={80} value={props.logoHeight || 40}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.logoHeight = parseInt(e.target.value) }, 500)}
          className="w-full" />
        <span className="text-xs text-gray-400">{props.logoHeight}px</span>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={props.grayscale ?? true}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.grayscale = e.target.checked })} />
        <span className="text-xs text-gray-600">Escala de cinza</span>
      </label>

      <div>
        <label className="text-xs text-gray-400">Opacidade ({Math.round((props.opacity || 0.6) * 100)}%)</label>
        <input type="range" min={20} max={100} value={Math.round((props.opacity || 0.6) * 100)}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.opacity = parseInt(e.target.value) / 100 }, 500)}
          className="w-full" />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={props.hoverEffect ?? true}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.hoverEffect = e.target.checked })} />
        <span className="text-xs text-gray-600">Efeito hover (cor + opacidade)</span>
      </label>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Cores</h4>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-400">Fundo</label>
            <ColorInput value={props.background || 'transparent'}
              onChange={(v) => setProp((p: Record<string, unknown>) => { p.background = v })} />
          </div>
          <div>
            <label className="text-xs text-gray-400">Título</label>
            <ColorInput value={props.titleColor || '#9ca3af'}
              onChange={(v) => setProp((p: Record<string, unknown>) => { p.titleColor = v })} />
          </div>
        </div>
      </div>
    </div>
  )
}

export const LogoGridComponent: UserComponent<Partial<LogoGridProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const { connectors: { connect } } = useNode()

  const {
    logos, columns, gap, logoHeight, grayscale, opacity,
    hoverEffect, background, padding, title, titleColor, titleSize,
  } = props

  const imgStyle: React.CSSProperties = {
    height: `${logoHeight}px`,
    width: 'auto',
    maxWidth: '100%',
    objectFit: 'contain',
    filter: grayscale ? 'grayscale(100%)' : 'none',
    opacity,
    transition: 'all 0.3s ease',
  }

  return (
    <div
      ref={(ref) => { if (ref) connect(ref) }}
      style={{ width: '100%', background, padding: `${padding}px`, textAlign: 'center' }}
    >
      {title && (
        <div
          style={{
            fontSize: `${titleSize}px`,
            color: titleColor,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '20px',
          }}
        >
          {title}
        </div>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${gap}px`,
          alignItems: 'center',
          justifyItems: 'center',
        }}
      >
        {logos.map((logo, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src={logo.src}
              alt={logo.alt}
              style={imgStyle}
              onMouseEnter={(e) => {
                if (!hoverEffect) return
                const el = e.target as HTMLElement
                el.style.filter = 'grayscale(0%)'
                el.style.opacity = '1'
              }}
              onMouseLeave={(e) => {
                if (!hoverEffect) return
                const el = e.target as HTMLElement
                el.style.filter = grayscale ? 'grayscale(100%)' : 'none'
                el.style.opacity = String(opacity)
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

LogoGridComponent.craft = {
  displayName: 'Logo Grid',
  props: defaultProps,
  rules: { canMoveIn: () => false },
  related: { settings: LogoGridSettings },
}
