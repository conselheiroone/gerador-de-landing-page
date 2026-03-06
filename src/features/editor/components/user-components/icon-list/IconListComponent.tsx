import { useNode, type UserComponent } from '@craftjs/core'
import { ColorInput } from '../../ColorInput'
import { Check, CheckCircle, ChevronRight, ArrowRight, Star, Minus, Trash2, Plus } from 'lucide-react'

type IconListItem = {
  text: string
}

type IconType = 'check' | 'check-circle' | 'chevron' | 'arrow' | 'star' | 'dash'

export type IconListProps = {
  items: IconListItem[]
  iconType: IconType
  iconColor: string
  iconSize: number
  textColor: string
  fontSize: number
  gap: number
  lineHeight: number
}

const defaultProps: IconListProps = {
  items: [
    { text: 'Atendimento personalizado e dedicado' },
    { text: 'Resultados comprovados e mensuráveis' },
    { text: 'Equipe especializada e experiente' },
    { text: 'Suporte contínuo e acompanhamento' },
  ],
  iconType: 'check-circle',
  iconColor: '#16a34a',
  iconSize: 18,
  textColor: '#374151',
  fontSize: 15,
  gap: 12,
  lineHeight: 1.5,
}

const ICON_COMPONENTS: Record<IconType, React.ComponentType<{ size?: number }>> = {
  'check': Check,
  'check-circle': CheckCircle,
  'chevron': ChevronRight,
  'arrow': ArrowRight,
  'star': Star,
  'dash': Minus,
}

const ICON_LABELS: Record<IconType, string> = {
  'check': 'Check', 'check-circle': 'Check Círculo', 'chevron': 'Seta >',
  'arrow': 'Seta →', 'star': 'Estrela', 'dash': 'Traço',
}

const IconListSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }))

  const items: IconListItem[] = props.items || defaultProps.items

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Ícone</h4>
        <div className="flex flex-wrap gap-1">
          {(Object.keys(ICON_COMPONENTS) as IconType[]).map((t) => {
            const Icon = ICON_COMPONENTS[t]
            return (
              <button
                key={t}
                onClick={() => setProp((p: Record<string, unknown>) => { p.iconType = t })}
                className={`flex items-center gap-1 px-2 py-1 text-xs rounded ${
                  props.iconType === t
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon size={12} />
                {ICON_LABELS[t]}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Itens ({items.length})</h4>
        <div className="space-y-1.5">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-1">
              <input
                type="text"
                value={item.text}
                onChange={(e) =>
                  setProp((p: Record<string, unknown>) => {
                    const arr = [...(p.items as IconListItem[])]
                    arr[i] = { ...arr[i], text: e.target.value }
                    p.items = arr
                  })
                }
                className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded bg-white"
              />
              {items.length > 1 && (
                <button
                  onClick={() =>
                    setProp((p: Record<string, unknown>) => {
                      const arr = [...(p.items as IconListItem[])]
                      arr.splice(i, 1)
                      p.items = arr
                    })
                  }
                  className="p-1 text-gray-400 hover:text-red-500"
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
              const arr = [...(p.items as IconListItem[])]
              arr.push({ text: 'Novo item' })
              p.items = arr
            })
          }
          className="mt-2 w-full flex items-center justify-center gap-1 py-1.5 text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100"
        >
          <Plus className="h-3 w-3" />
          Adicionar Item
        </button>
      </div>

      <div>
        <label className="text-xs text-gray-400">Tamanho do Ícone</label>
        <input
          type="range" min={12} max={28}
          value={props.iconSize || 18}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.iconSize = parseInt(e.target.value) }, 500)}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.iconSize}px</span>
      </div>

      <div>
        <label className="text-xs text-gray-400">Tamanho do Texto</label>
        <input
          type="range" min={12} max={22}
          value={props.fontSize || 15}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.fontSize = parseInt(e.target.value) }, 500)}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.fontSize}px</span>
      </div>

      <div>
        <label className="text-xs text-gray-400">Espaçamento</label>
        <input
          type="range" min={4} max={24}
          value={props.gap || 12}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.gap = parseInt(e.target.value) }, 500)}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.gap}px</span>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Cores</h4>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-400">Cor do Ícone</label>
            <ColorInput
              value={props.iconColor || '#16a34a'}
              onChange={(v) => setProp((p: Record<string, unknown>) => { p.iconColor = v })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Cor do Texto</label>
            <ColorInput
              value={props.textColor || '#374151'}
              onChange={(v) => setProp((p: Record<string, unknown>) => { p.textColor = v })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export const IconListComponent: UserComponent<Partial<IconListProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const { connectors: { connect } } = useNode()

  const { items, iconType, iconColor, iconSize, textColor, fontSize, gap, lineHeight } = props
  const Icon = ICON_COMPONENTS[iconType] || CheckCircle

  return (
    <div
      ref={(ref) => { if (ref) connect(ref) }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: `${gap}px`,
        width: '100%',
      }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
          }}
        >
          <span style={{ color: iconColor, flexShrink: 0, marginTop: '2px' }}>
            <Icon size={iconSize} />
          </span>
          <span
            style={{
              color: textColor,
              fontSize: `${fontSize}px`,
              lineHeight,
            }}
          >
            {item.text}
          </span>
        </div>
      ))}
    </div>
  )
}

IconListComponent.craft = {
  displayName: 'Lista Ícones',
  props: defaultProps,
  rules: {
    canMoveIn: () => false,
  },
  related: {
    settings: IconListSettings,
  },
}
