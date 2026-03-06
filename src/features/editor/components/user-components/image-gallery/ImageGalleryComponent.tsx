import { useState } from 'react'
import { useNode, type UserComponent } from '@craftjs/core'
import { ColorInput } from '../../ColorInput'
import { Trash2, Plus, X } from 'lucide-react'

type GalleryImage = {
  src: string
  alt: string
}

export type ImageGalleryProps = {
  images: GalleryImage[]
  columns: number
  gap: number
  borderRadius: number
  imageHeight: number
  objectFit: 'cover' | 'contain'
  showLightbox: boolean
  background: string
}

const defaultProps: ImageGalleryProps = {
  images: [
    { src: 'https://placehold.co/400x300/e2e8f0/64748b?text=Imagem+1', alt: 'Imagem 1' },
    { src: 'https://placehold.co/400x300/dbeafe/3b82f6?text=Imagem+2', alt: 'Imagem 2' },
    { src: 'https://placehold.co/400x300/fce7f3/ec4899?text=Imagem+3', alt: 'Imagem 3' },
    { src: 'https://placehold.co/400x300/dcfce7/22c55e?text=Imagem+4', alt: 'Imagem 4' },
    { src: 'https://placehold.co/400x300/fef3c7/f59e0b?text=Imagem+5', alt: 'Imagem 5' },
    { src: 'https://placehold.co/400x300/e0e7ff/6366f1?text=Imagem+6', alt: 'Imagem 6' },
  ],
  columns: 3,
  gap: 8,
  borderRadius: 8,
  imageHeight: 200,
  objectFit: 'cover',
  showLightbox: true,
  background: 'transparent',
}

const ImageGallerySettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }))
  const images: GalleryImage[] = props.images || defaultProps.images

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Imagens ({images.length})</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {images.map((img, i) => (
            <div key={i} className="flex items-center gap-1 p-1.5 bg-gray-50 rounded border border-gray-200">
              <input
                type="text"
                value={img.src}
                onChange={(e) =>
                  setProp((p: Record<string, unknown>) => {
                    const arr = [...(p.images as GalleryImage[])]
                    arr[i] = { ...arr[i], src: e.target.value }
                    p.images = arr
                  })
                }
                placeholder="URL da imagem"
                className="flex-1 px-1.5 py-0.5 text-[10px] border border-gray-200 rounded bg-white"
              />
              {images.length > 1 && (
                <button
                  onClick={() =>
                    setProp((p: Record<string, unknown>) => {
                      const arr = [...(p.images as GalleryImage[])]
                      arr.splice(i, 1)
                      p.images = arr
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
              const arr = [...(p.images as GalleryImage[])]
              const n = arr.length + 1
              arr.push({ src: `https://placehold.co/400x300/e2e8f0/64748b?text=Imagem+${n}`, alt: `Imagem ${n}` })
              p.images = arr
            })
          }
          className="mt-2 w-full flex items-center justify-center gap-1 py-1.5 text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100"
        >
          <Plus className="h-3 w-3" />
          Adicionar Imagem
        </button>
      </div>

      <div>
        <label className="text-xs text-gray-400">Colunas</label>
        <div className="flex gap-1">
          {[2, 3, 4, 5].map((c) => (
            <button
              key={c}
              onClick={() => setProp((p: Record<string, unknown>) => { p.columns = c })}
              className={`px-3 py-1 text-xs rounded ${
                props.columns === c ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400">Espaçamento (px)</label>
        <input type="range" min={0} max={24} value={props.gap || 8}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.gap = parseInt(e.target.value) }, 500)}
          className="w-full" />
        <span className="text-xs text-gray-400">{props.gap}px</span>
      </div>

      <div>
        <label className="text-xs text-gray-400">Altura da Imagem (px)</label>
        <input type="range" min={100} max={400} value={props.imageHeight || 200}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.imageHeight = parseInt(e.target.value) }, 500)}
          className="w-full" />
        <span className="text-xs text-gray-400">{props.imageHeight}px</span>
      </div>

      <div>
        <label className="text-xs text-gray-400">Arredondamento (px)</label>
        <input type="range" min={0} max={24} value={props.borderRadius || 8}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.borderRadius = parseInt(e.target.value) }, 500)}
          className="w-full" />
        <span className="text-xs text-gray-400">{props.borderRadius}px</span>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Ajuste</h4>
        <div className="flex gap-1">
          {(['cover', 'contain'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setProp((p: Record<string, unknown>) => { p.objectFit = f })}
              className={`px-3 py-1 text-xs rounded ${
                props.objectFit === f ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'cover' ? 'Cobrir' : 'Conter'}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={props.showLightbox ?? true}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.showLightbox = e.target.checked })} />
        <span className="text-xs text-gray-600">Lightbox ao clicar</span>
      </label>

      <div>
        <label className="text-xs text-gray-400">Fundo</label>
        <ColorInput value={props.background || 'transparent'}
          onChange={(v) => setProp((p: Record<string, unknown>) => { p.background = v })} />
      </div>
    </div>
  )
}

export const ImageGalleryComponent: UserComponent<Partial<ImageGalleryProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const { connectors: { connect } } = useNode()
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  const { images, columns, gap, borderRadius, imageHeight, objectFit, showLightbox, background } = props

  return (
    <div ref={(ref) => { if (ref) connect(ref) }} style={{ width: '100%', background }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${gap}px`,
        }}
      >
        {images.map((img, i) => (
          <div
            key={i}
            onClick={() => showLightbox && setLightboxIdx(i)}
            style={{
              overflow: 'hidden',
              borderRadius: `${borderRadius}px`,
              cursor: showLightbox ? 'pointer' : 'default',
            }}
          >
            <img
              src={img.src}
              alt={img.alt}
              style={{
                width: '100%',
                height: `${imageHeight}px`,
                objectFit,
                display: 'block',
                transition: 'transform 0.3s ease',
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.transform = 'scale(1.05)' }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.transform = 'scale(1)' }}
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          onClick={() => setLightboxIdx(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <button
            onClick={() => setLightboxIdx(null)}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            <X size={28} />
          </button>
          <img
            src={images[lightboxIdx]?.src}
            alt={images[lightboxIdx]?.alt}
            style={{
              maxWidth: '90vw',
              maxHeight: '85vh',
              objectFit: 'contain',
              borderRadius: '8px',
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

ImageGalleryComponent.craft = {
  displayName: 'Galeria',
  props: defaultProps,
  rules: { canMoveIn: () => false },
  related: { settings: ImageGallerySettings },
}
