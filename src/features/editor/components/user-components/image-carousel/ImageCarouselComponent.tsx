import { useState, useEffect, useCallback } from 'react'
import { useNode, useEditor, type UserComponent } from '@craftjs/core'
import { ColorInput } from '../../ColorInput'
import { ChevronLeft, ChevronRight, Trash2, Plus } from 'lucide-react'

type CarouselSlide = {
  src: string
  alt: string
  caption: string
}

export type ImageCarouselProps = {
  slides: CarouselSlide[]
  autoplay: boolean
  interval: number
  showArrows: boolean
  showDots: boolean
  showCaptions: boolean
  height: number
  borderRadius: number
  objectFit: 'cover' | 'contain'
  arrowColor: string
  dotColor: string
}

const defaultProps: ImageCarouselProps = {
  slides: [
    { src: 'https://placehold.co/800x400/1e3a5f/ffffff?text=Slide+1', alt: 'Slide 1', caption: 'Primeiro slide da apresentação' },
    { src: 'https://placehold.co/800x400/2563eb/ffffff?text=Slide+2', alt: 'Slide 2', caption: 'Segundo slide com destaque' },
    { src: 'https://placehold.co/800x400/7c3aed/ffffff?text=Slide+3', alt: 'Slide 3', caption: 'Terceiro slide informativo' },
  ],
  autoplay: true,
  interval: 4000,
  showArrows: true,
  showDots: true,
  showCaptions: true,
  height: 350,
  borderRadius: 12,
  objectFit: 'cover',
  arrowColor: '#ffffff',
  dotColor: '#ffffff',
}

const ImageCarouselSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }))
  const slides: CarouselSlide[] = props.slides || defaultProps.slides

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Slides ({slides.length})</h4>
        <div className="space-y-2 max-h-52 overflow-y-auto">
          {slides.map((slide, i) => (
            <div key={i} className="p-2 bg-gray-50 rounded border border-gray-200">
              <div className="flex items-center gap-1 mb-1">
                <input
                  type="text" value={slide.src}
                  onChange={(e) =>
                    setProp((p: Record<string, unknown>) => {
                      const arr = [...(p.slides as CarouselSlide[])]
                      arr[i] = { ...arr[i], src: e.target.value }
                      p.slides = arr
                    })
                  }
                  placeholder="URL da imagem"
                  className="flex-1 px-1.5 py-0.5 text-[10px] border border-gray-200 rounded bg-white"
                />
                {slides.length > 1 && (
                  <button
                    onClick={() =>
                      setProp((p: Record<string, unknown>) => {
                        const arr = [...(p.slides as CarouselSlide[])]
                        arr.splice(i, 1)
                        p.slides = arr
                      })
                    }
                    className="p-0.5 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
              <input
                type="text" value={slide.caption}
                onChange={(e) =>
                  setProp((p: Record<string, unknown>) => {
                    const arr = [...(p.slides as CarouselSlide[])]
                    arr[i] = { ...arr[i], caption: e.target.value }
                    p.slides = arr
                  })
                }
                placeholder="Legenda (opcional)"
                className="w-full px-1.5 py-0.5 text-[10px] border border-gray-200 rounded bg-white"
              />
            </div>
          ))}
        </div>
        <button
          onClick={() =>
            setProp((p: Record<string, unknown>) => {
              const arr = [...(p.slides as CarouselSlide[])]
              const n = arr.length + 1
              arr.push({ src: `https://placehold.co/800x400/e2e8f0/64748b?text=Slide+${n}`, alt: `Slide ${n}`, caption: '' })
              p.slides = arr
            })
          }
          className="mt-2 w-full flex items-center justify-center gap-1 py-1.5 text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100"
        >
          <Plus className="h-3 w-3" />
          Adicionar Slide
        </button>
      </div>

      <div>
        <label className="text-xs text-gray-400">Altura (px)</label>
        <input type="range" min={150} max={600} value={props.height || 350}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.height = parseInt(e.target.value) }, 500)}
          className="w-full" />
        <span className="text-xs text-gray-400">{props.height}px</span>
      </div>

      <div>
        <label className="text-xs text-gray-400">Arredondamento (px)</label>
        <input type="range" min={0} max={24} value={props.borderRadius || 12}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.borderRadius = parseInt(e.target.value) }, 500)}
          className="w-full" />
        <span className="text-xs text-gray-400">{props.borderRadius}px</span>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={props.autoplay ?? true}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.autoplay = e.target.checked })} />
        <span className="text-xs text-gray-600">Autoplay</span>
      </label>

      {props.autoplay && (
        <div>
          <label className="text-xs text-gray-400">Intervalo (ms)</label>
          <input type="range" min={1000} max={8000} step={500} value={props.interval || 4000}
            onChange={(e) => setProp((p: Record<string, unknown>) => { p.interval = parseInt(e.target.value) }, 500)}
            className="w-full" />
          <span className="text-xs text-gray-400">{props.interval}ms</span>
        </div>
      )}

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={props.showArrows ?? true}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.showArrows = e.target.checked })} />
        <span className="text-xs text-gray-600">Mostrar setas</span>
      </label>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={props.showDots ?? true}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.showDots = e.target.checked })} />
        <span className="text-xs text-gray-600">Mostrar indicadores</span>
      </label>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={props.showCaptions ?? true}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.showCaptions = e.target.checked })} />
        <span className="text-xs text-gray-600">Mostrar legendas</span>
      </label>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Cores</h4>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-400">Setas</label>
            <ColorInput value={props.arrowColor || '#ffffff'}
              onChange={(v) => setProp((p: Record<string, unknown>) => { p.arrowColor = v })} />
          </div>
          <div>
            <label className="text-xs text-gray-400">Indicadores</label>
            <ColorInput value={props.dotColor || '#ffffff'}
              onChange={(v) => setProp((p: Record<string, unknown>) => { p.dotColor = v })} />
          </div>
        </div>
      </div>
    </div>
  )
}

export const ImageCarouselComponent: UserComponent<Partial<ImageCarouselProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const { connectors: { connect } } = useNode()
  const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }))
  const [current, setCurrent] = useState(0)

  const { slides, autoplay, interval, showArrows, showDots, showCaptions, height, borderRadius, objectFit, arrowColor, dotColor } = props

  const goTo = useCallback((idx: number) => {
    setCurrent(((idx % slides.length) + slides.length) % slides.length)
  }, [slides.length])

  useEffect(() => {
    if (!autoplay || enabled || slides.length <= 1) return
    const timer = setInterval(() => goTo(current + 1), interval)
    return () => clearInterval(timer)
  }, [autoplay, enabled, current, interval, slides.length, goTo])

  const btnStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(0,0,0,0.35)',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: arrowColor,
    zIndex: 2,
  }

  return (
    <div
      ref={(ref) => { if (ref) connect(ref) }}
      style={{
        position: 'relative',
        width: '100%',
        height: `${height}px`,
        borderRadius: `${borderRadius}px`,
        overflow: 'hidden',
      }}
    >
      {/* Slide */}
      <img
        src={slides[current]?.src}
        alt={slides[current]?.alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit,
          display: 'block',
          transition: 'opacity 0.4s ease',
        }}
      />

      {/* Caption */}
      {showCaptions && slides[current]?.caption && (
        <div
          style={{
            position: 'absolute',
            bottom: showDots ? '40px' : '16px',
            left: 0,
            right: 0,
            textAlign: 'center',
            padding: '8px 16px',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
            color: '#fff',
            fontSize: '14px',
          }}
        >
          {slides[current].caption}
        </div>
      )}

      {/* Arrows */}
      {showArrows && slides.length > 1 && (
        <>
          <button onClick={() => goTo(current - 1)} style={{ ...btnStyle, left: '8px' }}>
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => goTo(current + 1)} style={{ ...btnStyle, right: '8px' }}>
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dots */}
      {showDots && slides.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            gap: '6px',
            zIndex: 2,
          }}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: i === current ? '20px' : '8px',
                height: '8px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: dotColor,
                opacity: i === current ? 1 : 0.5,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

ImageCarouselComponent.craft = {
  displayName: 'Carrossel',
  props: defaultProps,
  rules: { canMoveIn: () => false },
  related: { settings: ImageCarouselSettings },
}
