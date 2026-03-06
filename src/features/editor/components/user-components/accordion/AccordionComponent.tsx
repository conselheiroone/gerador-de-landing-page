import { useState } from 'react'
import { useNode, type UserComponent } from '@craftjs/core'
import { ColorInput } from '../../ColorInput'
import { ChevronDown, Trash2, Plus } from 'lucide-react'

export type AccordionItem = {
  titulo: string
  conteudo: string
}

export type AccordionStyle = 'simple' | 'bordered' | 'filled'

export type AccordionProps = {
  items: AccordionItem[]
  allowMultiple: boolean
  style: AccordionStyle
  iconPosition: 'left' | 'right'
  background: string
  accentColor: string
  textColor: string
  gap: number
  fontSize: number
}

const defaultProps: AccordionProps = {
  items: [
    { titulo: 'O que é este serviço?', conteudo: 'Nosso serviço oferece soluções completas para o seu negócio, com suporte personalizado e resultados comprovados.' },
    { titulo: 'Como funciona o processo?', conteudo: 'O processo é simples: entre em contato, agende uma reunião e receba um plano personalizado para suas necessidades.' },
    { titulo: 'Quais são as formas de pagamento?', conteudo: 'Aceitamos diversas formas de pagamento, incluindo cartão de crédito, boleto bancário e transferência.' },
  ],
  allowMultiple: false,
  style: 'bordered',
  iconPosition: 'right',
  background: '#ffffff',
  accentColor: '#2563eb',
  textColor: '#374151',
  gap: 8,
  fontSize: 15,
}

// ── Settings ─────────────────────────────────────────────

const AccordionSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }))

  const items: AccordionItem[] = props.items || defaultProps.items

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Estilo</h4>
        <div className="flex gap-1">
          {(['simple', 'bordered', 'filled'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setProp((p: Record<string, unknown>) => { p.style = s })}
              className={`px-3 py-1 text-xs rounded ${
                props.style === s
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'simple' ? 'Simples' : s === 'bordered' ? 'Bordas' : 'Preenchido'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Ícone</h4>
        <div className="flex gap-1">
          {(['left', 'right'] as const).map((pos) => (
            <button
              key={pos}
              onClick={() => setProp((p: Record<string, unknown>) => { p.iconPosition = pos })}
              className={`px-3 py-1 text-xs rounded ${
                props.iconPosition === pos
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {pos === 'left' ? 'Esquerda' : 'Direita'}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={props.allowMultiple || false}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.allowMultiple = e.target.checked })}
        />
        <span className="text-xs text-gray-600">Permitir múltiplos abertos</span>
      </label>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Itens ({items.length})</h4>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="p-2 bg-gray-50 rounded border border-gray-200">
              <div className="flex items-center gap-1 mb-1">
                <input
                  type="text"
                  value={item.titulo}
                  onChange={(e) =>
                    setProp((p: Record<string, unknown>) => {
                      const arr = [...(p.items as AccordionItem[])]
                      arr[i] = { ...arr[i], titulo: e.target.value }
                      p.items = arr
                    })
                  }
                  placeholder="Título"
                  className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded bg-white font-medium"
                />
                {items.length > 1 && (
                  <button
                    onClick={() =>
                      setProp((p: Record<string, unknown>) => {
                        const arr = [...(p.items as AccordionItem[])]
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
              <textarea
                value={item.conteudo}
                onChange={(e) =>
                  setProp((p: Record<string, unknown>) => {
                    const arr = [...(p.items as AccordionItem[])]
                    arr[i] = { ...arr[i], conteudo: e.target.value }
                    p.items = arr
                  })
                }
                placeholder="Conteúdo"
                rows={2}
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded bg-white resize-none"
              />
            </div>
          ))}
        </div>
        <button
          onClick={() =>
            setProp((p: Record<string, unknown>) => {
              const arr = [...(p.items as AccordionItem[])]
              arr.push({ titulo: 'Nova pergunta', conteudo: 'Resposta aqui...' })
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
        <label className="text-xs text-gray-400">Espaçamento (px)</label>
        <input
          type="range"
          min={0}
          max={24}
          value={props.gap || 8}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.gap = parseInt(e.target.value) }, 500)}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.gap}px</span>
      </div>

      <div>
        <label className="text-xs text-gray-400">Tamanho do Texto</label>
        <input
          type="range"
          min={12}
          max={20}
          value={props.fontSize || 15}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.fontSize = parseInt(e.target.value) }, 500)}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.fontSize}px</span>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Cores</h4>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-400">Fundo</label>
            <ColorInput
              value={props.background || '#ffffff'}
              onChange={(v) => setProp((p: Record<string, unknown>) => { p.background = v })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Cor de Acento</label>
            <ColorInput
              value={props.accentColor || '#2563eb'}
              onChange={(v) => setProp((p: Record<string, unknown>) => { p.accentColor = v })}
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

// ── Componente ───────────────────────────────────────────

export const AccordionComponent: UserComponent<Partial<AccordionProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const { connectors: { connect } } = useNode()
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())

  const {
    items, allowMultiple, style, iconPosition,
    background, accentColor, textColor, gap, fontSize,
  } = props

  const toggle = (index: number) => {
    setOpenItems((prev) => {
      const next = new Set(allowMultiple ? prev : [])
      if (prev.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const getItemStyle = (isOpen: boolean): React.CSSProperties => {
    const base: React.CSSProperties = {
      borderRadius: '8px',
      overflow: 'hidden',
      transition: 'all 0.2s ease',
    }

    if (style === 'bordered') {
      base.border = `1px solid ${isOpen ? accentColor : '#e5e7eb'}`
    } else if (style === 'filled') {
      base.backgroundColor = isOpen ? `${accentColor}08` : '#f9fafb'
      base.border = `1px solid ${isOpen ? accentColor : 'transparent'}`
    } else {
      // simple
      base.borderBottom = '1px solid #e5e7eb'
      base.borderRadius = '0'
    }

    return base
  }

  return (
    <div
      ref={(ref) => { if (ref) connect(ref) }}
      style={{
        background,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: `${gap}px`,
      }}
    >
      {items.map((item, i) => {
        const isOpen = openItems.has(i)
        return (
          <div key={i} style={getItemStyle(isOpen)}>
            {/* Header */}
            <button
              onClick={() => toggle(i)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection: iconPosition === 'left' ? 'row-reverse' : 'row',
                gap: '12px',
                padding: '14px 18px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  flex: 1,
                  fontSize: `${fontSize}px`,
                  fontWeight: 600,
                  color: isOpen ? accentColor : textColor,
                  lineHeight: '1.4',
                }}
              >
                {item.titulo}
              </span>
              <ChevronDown
                size={18}
                style={{
                  color: isOpen ? accentColor : '#9ca3af',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s ease',
                  flexShrink: 0,
                }}
              />
            </button>

            {/* Content */}
            {isOpen && (
              <div
                style={{
                  padding: '0 18px 16px',
                  fontSize: `${fontSize - 1}px`,
                  lineHeight: '1.6',
                  color: textColor,
                  opacity: 0.85,
                }}
              >
                {item.conteudo}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

AccordionComponent.craft = {
  displayName: 'Sanfona',
  props: defaultProps,
  rules: {
    canMoveIn: () => false,
  },
  related: {
    settings: AccordionSettings,
  },
}
