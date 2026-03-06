import { useNode, useEditor, type UserComponent } from '@craftjs/core'
import { ColorInput } from '../../ColorInput'

export type ColumnsLayout = '100' | '50-50' | '33-33-33' | '25-25-25-25' | '70-30' | '30-70' | '25-50-25'

export type ColumnsProps = {
  layout: ColumnsLayout
  gap: number
  background: string
  padding: number
  minHeight: number
  children?: React.ReactNode
}

const defaultProps: ColumnsProps = {
  layout: '50-50',
  gap: 16,
  background: 'transparent',
  padding: 0,
  minHeight: 80,
}

const LAYOUT_RATIOS: Record<ColumnsLayout, number[]> = {
  '100': [1],
  '50-50': [1, 1],
  '33-33-33': [1, 1, 1],
  '25-25-25-25': [1, 1, 1, 1],
  '70-30': [7, 3],
  '30-70': [3, 7],
  '25-50-25': [1, 2, 1],
}

const LAYOUT_LABELS: Record<ColumnsLayout, string> = {
  '100': '1 coluna',
  '50-50': '50 / 50',
  '33-33-33': '33 / 33 / 33',
  '25-25-25-25': '25 cada',
  '70-30': '70 / 30',
  '30-70': '30 / 70',
  '25-50-25': '25 / 50 / 25',
}

// ── Miniatura visual dos layouts ─────────────────────────

function LayoutIcon({ layout, active }: { layout: ColumnsLayout; active: boolean }) {
  const ratios = LAYOUT_RATIOS[layout]
  const total = ratios.reduce((a, b) => a + b, 0)
  return (
    <div
      className={`flex gap-0.5 h-5 w-full rounded overflow-hidden border ${
        active ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'
      }`}
    >
      {ratios.map((r, i) => (
        <div
          key={i}
          className={active ? 'bg-blue-400' : 'bg-gray-300'}
          style={{ flex: r / total }}
        />
      ))}
    </div>
  )
}

// ── Settings ─────────────────────────────────────────────

const ColumnsSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }))

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Layout</h4>
        <div className="grid grid-cols-2 gap-1.5">
          {(Object.keys(LAYOUT_RATIOS) as ColumnsLayout[]).map((l) => (
            <button
              key={l}
              onClick={() => setProp((p: Record<string, unknown>) => { p.layout = l })}
              className={`flex flex-col items-center gap-1 p-2 rounded border text-center ${
                props.layout === l
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <LayoutIcon layout={l} active={props.layout === l} />
              <span className="text-[9px] text-gray-500 leading-tight">{LAYOUT_LABELS[l]}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400">Espaçamento (px)</label>
        <input
          type="range"
          min={0}
          max={48}
          value={props.gap || 16}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.gap = parseInt(e.target.value) }, 500)}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.gap}px</span>
      </div>

      <div>
        <label className="text-xs text-gray-400">Padding (px)</label>
        <input
          type="range"
          min={0}
          max={60}
          value={props.padding || 0}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.padding = parseInt(e.target.value) }, 500)}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.padding}px</span>
      </div>

      <div>
        <label className="text-xs text-gray-400">Altura Mínima (px)</label>
        <input
          type="range"
          min={40}
          max={400}
          value={props.minHeight || 80}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.minHeight = parseInt(e.target.value) }, 500)}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.minHeight}px</span>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Fundo</h4>
        <ColorInput
          value={props.background || 'transparent'}
          onChange={(v) => setProp((p: Record<string, unknown>) => { p.background = v })}
        />
      </div>
    </div>
  )
}

// ── Componente ───────────────────────────────────────────

export const ColumnsComponent: UserComponent<Partial<ColumnsProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const { connectors: { connect, drag } } = useNode()
  const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }))

  const { layout, gap, background, padding, minHeight, children } = props
  const ratios = LAYOUT_RATIOS[layout]

  // Aplica flex ratios nos filhos diretos
  const childArray = Array.isArray(children)
    ? children
    : children
      ? [children]
      : []

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)) }}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: `${gap}px`,
        background,
        padding: `${padding}px`,
        minHeight: `${minHeight}px`,
        width: '100%',
      }}
    >
      {childArray.length > 0
        ? childArray.map((child, i) => (
            <div
              key={i}
              style={{
                flex: ratios[i % ratios.length] || 1,
                minWidth: 0,
              }}
            >
              {child}
            </div>
          ))
        : enabled && (
            // Placeholder no editor quando vazio
            <div
              style={{
                display: 'flex',
                gap: `${gap}px`,
                width: '100%',
                minHeight: `${minHeight}px`,
              }}
            >
              {ratios.map((r, i) => (
                <div
                  key={i}
                  style={{
                    flex: r,
                    minHeight: `${minHeight}px`,
                    border: '2px dashed #d1d5db',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>Coluna {i + 1}</span>
                </div>
              ))}
            </div>
          )}
    </div>
  )
}

ColumnsComponent.craft = {
  displayName: 'Colunas',
  props: defaultProps,
  rules: {
    canDrag: () => true,
  },
  related: {
    settings: ColumnsSettings,
  },
}
