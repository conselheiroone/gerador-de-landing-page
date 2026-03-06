import { useState } from 'react'
import { useNode, type UserComponent } from '@craftjs/core'
import { ColorInput } from '../../ColorInput'
import { Trash2, Plus } from 'lucide-react'

export type TabItem = {
  label: string
  content: string
}

export type TabStyle = 'underline' | 'pills' | 'boxed'

export type TabsProps = {
  tabs: TabItem[]
  tabStyle: TabStyle
  background: string
  tabColor: string
  activeColor: string
  textColor: string
  contentPadding: number
  fontSize: number
}

const defaultProps: TabsProps = {
  tabs: [
    { label: 'Aba 1', content: 'Conteúdo da primeira aba. Clique para editar nas configurações.' },
    { label: 'Aba 2', content: 'Conteúdo da segunda aba. Personalize o texto como preferir.' },
    { label: 'Aba 3', content: 'Conteúdo da terceira aba. Adicione ou remova abas no painel.' },
  ],
  tabStyle: 'underline',
  background: '#ffffff',
  tabColor: '#6b7280',
  activeColor: '#2563eb',
  textColor: '#374151',
  contentPadding: 24,
  fontSize: 15,
}

// ── Settings ─────────────────────────────────────────────

const TabsSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }))

  const tabs: TabItem[] = props.tabs || defaultProps.tabs

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Estilo</h4>
        <div className="flex gap-1">
          {(['underline', 'pills', 'boxed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setProp((p: Record<string, unknown>) => { p.tabStyle = s })}
              className={`px-3 py-1 text-xs rounded ${
                props.tabStyle === s
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'underline' ? 'Sublinhado' : s === 'pills' ? 'Pílulas' : 'Caixas'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Abas ({tabs.length})</h4>
        <div className="space-y-2">
          {tabs.map((tab, i) => (
            <div key={i} className="p-2 bg-gray-50 rounded border border-gray-200">
              <div className="flex items-center gap-1 mb-1">
                <input
                  type="text"
                  value={tab.label}
                  onChange={(e) =>
                    setProp((p: Record<string, unknown>) => {
                      const t = [...(p.tabs as TabItem[])]
                      t[i] = { ...t[i], label: e.target.value }
                      p.tabs = t
                    })
                  }
                  placeholder="Título da aba"
                  className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded bg-white"
                />
                {tabs.length > 1 && (
                  <button
                    onClick={() =>
                      setProp((p: Record<string, unknown>) => {
                        const t = [...(p.tabs as TabItem[])]
                        t.splice(i, 1)
                        p.tabs = t
                      })
                    }
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
              <textarea
                value={tab.content}
                onChange={(e) =>
                  setProp((p: Record<string, unknown>) => {
                    const t = [...(p.tabs as TabItem[])]
                    t[i] = { ...t[i], content: e.target.value }
                    p.tabs = t
                  })
                }
                placeholder="Conteúdo da aba"
                rows={2}
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded bg-white resize-none"
              />
            </div>
          ))}
        </div>
        <button
          onClick={() =>
            setProp((p: Record<string, unknown>) => {
              const t = [...(p.tabs as TabItem[])]
              t.push({ label: `Aba ${t.length + 1}`, content: 'Novo conteúdo...' })
              p.tabs = t
            })
          }
          className="mt-2 w-full flex items-center justify-center gap-1 py-1.5 text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100"
        >
          <Plus className="h-3 w-3" />
          Adicionar Aba
        </button>
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
        <label className="text-xs text-gray-400">Padding do Conteúdo</label>
        <input
          type="range"
          min={8}
          max={48}
          value={props.contentPadding || 24}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.contentPadding = parseInt(e.target.value) }, 500)}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.contentPadding}px</span>
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
            <label className="text-xs text-gray-400">Cor Ativa</label>
            <ColorInput
              value={props.activeColor || '#2563eb'}
              onChange={(v) => setProp((p: Record<string, unknown>) => { p.activeColor = v })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Cor Inativa</label>
            <ColorInput
              value={props.tabColor || '#6b7280'}
              onChange={(v) => setProp((p: Record<string, unknown>) => { p.tabColor = v })}
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

export const TabsComponent: UserComponent<Partial<TabsProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const { connectors: { connect } } = useNode()
  const [activeTab, setActiveTab] = useState(0)

  const { tabs, tabStyle, background, tabColor, activeColor, textColor, contentPadding, fontSize } = props

  const safeActive = activeTab >= tabs.length ? 0 : activeTab

  const getTabStyle = (isActive: boolean): React.CSSProperties => {
    const base: React.CSSProperties = {
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: isActive ? 600 : 400,
      cursor: 'pointer',
      border: 'none',
      background: 'none',
      color: isActive ? activeColor : tabColor,
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap',
    }

    if (tabStyle === 'underline') {
      base.borderBottom = isActive ? `2px solid ${activeColor}` : '2px solid transparent'
    } else if (tabStyle === 'pills') {
      base.backgroundColor = isActive ? activeColor : 'transparent'
      base.color = isActive ? '#ffffff' : tabColor
      base.borderRadius = '50px'
      base.padding = '8px 18px'
    } else if (tabStyle === 'boxed') {
      base.backgroundColor = isActive ? background : 'transparent'
      base.border = isActive ? `1px solid #e5e7eb` : '1px solid transparent'
      base.borderBottom = isActive ? `1px solid ${background}` : '1px solid #e5e7eb'
      base.borderRadius = '8px 8px 0 0'
      base.marginBottom = '-1px'
    }

    return base
  }

  return (
    <div
      ref={(ref) => { if (ref) connect(ref) }}
      style={{
        background,
        width: '100%',
        borderRadius: '8px',
      }}
    >
      {/* Tab headers */}
      <div
        style={{
          display: 'flex',
          gap: tabStyle === 'pills' ? '6px' : '0',
          borderBottom: tabStyle === 'boxed' ? '1px solid #e5e7eb' : tabStyle === 'underline' ? '1px solid #e5e7eb' : 'none',
          padding: tabStyle === 'pills' ? '8px' : '0 8px',
          overflowX: 'auto',
        }}
      >
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            style={getTabStyle(i === safeActive)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        style={{
          padding: `${contentPadding}px`,
          fontSize: `${fontSize}px`,
          lineHeight: '1.6',
          color: textColor,
        }}
      >
        {tabs[safeActive]?.content}
      </div>
    </div>
  )
}

TabsComponent.craft = {
  displayName: 'Abas',
  props: defaultProps,
  rules: {
    canMoveIn: () => false,
  },
  related: {
    settings: TabsSettings,
  },
}
