import { useState, useRef, useCallback } from 'react'
import { useNode, type UserComponent } from '@craftjs/core'
import { ColorInput } from '../../ColorInput'

export type BeforeAfterProps = {
  beforeSrc: string
  afterSrc: string
  beforeLabel: string
  afterLabel: string
  height: number
  borderRadius: number
  sliderColor: string
  labelBackground: string
  labelColor: string
  initialPosition: number
}

const defaultProps: BeforeAfterProps = {
  beforeSrc: 'https://placehold.co/600x400/ef4444/ffffff?text=ANTES',
  afterSrc: 'https://placehold.co/600x400/22c55e/ffffff?text=DEPOIS',
  beforeLabel: 'Antes',
  afterLabel: 'Depois',
  height: 350,
  borderRadius: 12,
  sliderColor: '#ffffff',
  labelBackground: 'rgba(0,0,0,0.6)',
  labelColor: '#ffffff',
  initialPosition: 50,
}

const BeforeAfterSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-gray-400">Imagem Antes (URL)</label>
        <input
          type="text" value={props.beforeSrc || ''}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.beforeSrc = e.target.value })}
          className="w-full px-2 py-1 text-xs border border-gray-200 rounded bg-gray-50"
        />
      </div>

      <div>
        <label className="text-xs text-gray-400">Imagem Depois (URL)</label>
        <input
          type="text" value={props.afterSrc || ''}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.afterSrc = e.target.value })}
          className="w-full px-2 py-1 text-xs border border-gray-200 rounded bg-gray-50"
        />
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-xs text-gray-400">Label Antes</label>
          <input type="text" value={props.beforeLabel || ''}
            onChange={(e) => setProp((p: Record<string, unknown>) => { p.beforeLabel = e.target.value })}
            className="w-full px-2 py-1 text-xs border border-gray-200 rounded bg-gray-50" />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-400">Label Depois</label>
          <input type="text" value={props.afterLabel || ''}
            onChange={(e) => setProp((p: Record<string, unknown>) => { p.afterLabel = e.target.value })}
            className="w-full px-2 py-1 text-xs border border-gray-200 rounded bg-gray-50" />
        </div>
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

      <div>
        <label className="text-xs text-gray-400">Posição Inicial ({props.initialPosition}%)</label>
        <input type="range" min={10} max={90} value={props.initialPosition || 50}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.initialPosition = parseInt(e.target.value) }, 500)}
          className="w-full" />
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Cores</h4>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-400">Slider</label>
            <ColorInput value={props.sliderColor || '#ffffff'}
              onChange={(v) => setProp((p: Record<string, unknown>) => { p.sliderColor = v })} />
          </div>
          <div>
            <label className="text-xs text-gray-400">Label</label>
            <ColorInput value={props.labelColor || '#ffffff'}
              onChange={(v) => setProp((p: Record<string, unknown>) => { p.labelColor = v })} />
          </div>
        </div>
      </div>
    </div>
  )
}

export const BeforeAfterComponent: UserComponent<Partial<BeforeAfterProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const { connectors: { connect } } = useNode()
  const [position, setPosition] = useState(props.initialPosition)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const {
    beforeSrc, afterSrc, beforeLabel, afterLabel,
    height, borderRadius, sliderColor, labelBackground, labelColor,
  } = props

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setPosition(pct)
  }, [])

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    updatePosition(e.clientX)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return
    updatePosition(e.clientX)
  }

  const onPointerUp = () => {
    dragging.current = false
  }

  const labelStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '12px',
    padding: '4px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
    backgroundColor: labelBackground,
    color: labelColor,
    userSelect: 'none',
    zIndex: 2,
  }

  return (
    <div
      ref={(ref) => {
        if (ref) {
          connect(ref)
          containerRef.current = ref
        }
      }}
      style={{
        position: 'relative',
        width: '100%',
        height: `${height}px`,
        borderRadius: `${borderRadius}px`,
        overflow: 'hidden',
        cursor: 'col-resize',
        userSelect: 'none',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* After (full background) */}
      <img
        src={afterSrc}
        alt="Depois"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', pointerEvents: 'none',
        }}
      />

      {/* Before (clipped) */}
      <div
        style={{
          position: 'absolute', inset: 0,
          width: `${position}%`,
          overflow: 'hidden',
        }}
      >
        <img
          src={beforeSrc}
          alt="Antes"
          style={{
            position: 'absolute', top: 0, left: 0,
            width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%',
            height: '100%',
            objectFit: 'cover',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Slider line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: `${position}%`,
          transform: 'translateX(-50%)',
          width: '3px',
          height: '100%',
          backgroundColor: sliderColor,
          zIndex: 3,
          boxShadow: '0 0 6px rgba(0,0,0,0.3)',
        }}
      />

      {/* Slider handle */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: `${position}%`,
          transform: 'translate(-50%, -50%)',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: sliderColor,
          border: '3px solid rgba(0,0,0,0.2)',
          zIndex: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M5 3L2 8L5 13" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M11 3L14 8L11 13" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Labels */}
      {beforeLabel && (
        <span style={{ ...labelStyle, left: '12px' }}>{beforeLabel}</span>
      )}
      {afterLabel && (
        <span style={{ ...labelStyle, right: '12px' }}>{afterLabel}</span>
      )}
    </div>
  )
}

BeforeAfterComponent.craft = {
  displayName: 'Antes/Depois',
  props: defaultProps,
  rules: { canMoveIn: () => false },
  related: { settings: BeforeAfterSettings },
}
