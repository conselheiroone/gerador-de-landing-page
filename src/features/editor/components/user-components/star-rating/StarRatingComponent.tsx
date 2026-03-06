import { useNode, type UserComponent } from '@craftjs/core'
import { ColorInput } from '../../ColorInput'
import { Star } from 'lucide-react'

export type StarRatingProps = {
  rating: number
  maxStars: number
  size: number
  filledColor: string
  emptyColor: string
  gap: number
  showLabel: boolean
  labelColor: string
  labelSize: number
}

const defaultProps: StarRatingProps = {
  rating: 4.5,
  maxStars: 5,
  size: 24,
  filledColor: '#f59e0b',
  emptyColor: '#e5e7eb',
  gap: 4,
  showLabel: true,
  labelColor: '#374151',
  labelSize: 16,
}

const StarRatingSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-gray-400">Nota ({props.rating})</label>
        <input
          type="range" min={0} max={props.maxStars || 5} step={0.5}
          value={props.rating || 4.5}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.rating = parseFloat(e.target.value) }, 500)}
          className="w-full"
        />
      </div>

      <div>
        <label className="text-xs text-gray-400">Total de Estrelas</label>
        <div className="flex gap-1">
          {[3, 4, 5, 6, 10].map((n) => (
            <button
              key={n}
              onClick={() => setProp((p: Record<string, unknown>) => { p.maxStars = n })}
              className={`px-2 py-1 text-xs rounded ${
                props.maxStars === n
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400">Tamanho (px)</label>
        <input
          type="range" min={14} max={48}
          value={props.size || 24}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.size = parseInt(e.target.value) }, 500)}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.size}px</span>
      </div>

      <div>
        <label className="text-xs text-gray-400">Espaçamento (px)</label>
        <input
          type="range" min={0} max={12}
          value={props.gap || 4}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.gap = parseInt(e.target.value) }, 500)}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.gap}px</span>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={props.showLabel ?? true}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.showLabel = e.target.checked })}
        />
        <span className="text-xs text-gray-600">Mostrar nota</span>
      </label>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Cores</h4>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-400">Estrela Preenchida</label>
            <ColorInput
              value={props.filledColor || '#f59e0b'}
              onChange={(v) => setProp((p: Record<string, unknown>) => { p.filledColor = v })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Estrela Vazia</label>
            <ColorInput
              value={props.emptyColor || '#e5e7eb'}
              onChange={(v) => setProp((p: Record<string, unknown>) => { p.emptyColor = v })}
            />
          </div>
          {props.showLabel && (
            <div>
              <label className="text-xs text-gray-400">Cor da Nota</label>
              <ColorInput
                value={props.labelColor || '#374151'}
                onChange={(v) => setProp((p: Record<string, unknown>) => { p.labelColor = v })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const StarRatingComponent: UserComponent<Partial<StarRatingProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const { connectors: { connect } } = useNode()

  const { rating, maxStars, size, filledColor, emptyColor, gap, showLabel, labelColor, labelSize } = props

  return (
    <div
      ref={(ref) => { if (ref) connect(ref) }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${gap + 4}px`,
      }}
    >
      <div style={{ display: 'flex', gap: `${gap}px` }}>
        {Array.from({ length: maxStars }, (_, i) => {
          const filled = i + 1 <= Math.floor(rating)
          const half = !filled && i < rating
          return (
            <span key={i} style={{ position: 'relative', display: 'inline-block', width: size, height: size }}>
              {/* Empty star (background) */}
              <Star
                size={size}
                fill={emptyColor}
                stroke="none"
                style={{ position: 'absolute', top: 0, left: 0 }}
              />
              {/* Filled star (foreground with clip for half) */}
              {(filled || half) && (
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: half ? '50%' : '100%',
                    overflow: 'hidden',
                    display: 'inline-block',
                  }}
                >
                  <Star size={size} fill={filledColor} stroke="none" />
                </span>
              )}
            </span>
          )
        })}
      </div>
      {showLabel && (
        <span
          style={{
            fontSize: `${labelSize}px`,
            fontWeight: 700,
            color: labelColor,
          }}
        >
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

StarRatingComponent.craft = {
  displayName: 'Estrelas',
  props: defaultProps,
  rules: {
    canMoveIn: () => false,
  },
  related: {
    settings: StarRatingSettings,
  },
}
