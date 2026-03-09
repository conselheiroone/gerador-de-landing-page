import { useNode } from '@craftjs/core'
import { ColorInput } from '../../ColorInput'
import {
  WhatsappLogo, Phone, Envelope, ArrowRight, Download, Play,
  ShoppingCart, Heart, Star, Check, Plus, PaperPlaneTilt,
} from '@phosphor-icons/react'

const BUTTON_ICONS = {
  whatsapp: WhatsappLogo,
  phone: Phone,
  email: Envelope,
  arrow: ArrowRight,
  download: Download,
  play: Play,
  cart: ShoppingCart,
  heart: Heart,
  star: Star,
  check: Check,
  plus: Plus,
  send: PaperPlaneTilt,
}

const BUTTON_ICON_NAMES: Record<string, string> = {
  whatsapp: 'WhatsApp',
  phone: 'Telefone',
  email: 'Email',
  arrow: 'Seta',
  download: 'Download',
  play: 'Play',
  cart: 'Carrinho',
  heart: 'Coração',
  star: 'Estrela',
  check: 'Check',
  plus: 'Mais',
  send: 'Enviar',
}

export const ButtonSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }))

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Texto</h4>
        <input
          type="text"
          value={props.text || ''}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.text = e.target.value })}
          className="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-gray-50"
        />
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Link</h4>
        <input
          type="text"
          value={props.href || ''}
          placeholder="https://..."
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.href = e.target.value })}
          className="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-gray-50"
        />
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Ícone</h4>
        <div className="grid grid-cols-7 gap-1 mb-2">
          <button
            onClick={() => setProp((p: Record<string, unknown>) => { p.icon = '' })}
            className={`p-1.5 rounded flex items-center justify-center text-xs ${
              !props.icon
                ? 'bg-blue-100 text-blue-600 ring-1 ring-blue-400'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
            title="Sem ícone"
          >
            ✕
          </button>
          {Object.entries(BUTTON_ICONS).map(([key, Icon]) => (
            <button
              key={key}
              onClick={() => setProp((p: Record<string, unknown>) => { p.icon = key })}
              className={`p-1.5 rounded flex items-center justify-center ${
                props.icon === key
                  ? 'bg-blue-100 text-blue-600 ring-1 ring-blue-400'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
              title={BUTTON_ICON_NAMES[key]}
            >
              <Icon size={16} weight="regular" />
            </button>
          ))}
        </div>
        {props.icon && (
          <div className="flex gap-1">
            <button
              onClick={() => setProp((p: Record<string, unknown>) => { p.iconPosition = 'left' })}
              className={`flex-1 px-2 py-1 text-xs rounded ${
                props.iconPosition !== 'right'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Esquerda
            </button>
            <button
              onClick={() => setProp((p: Record<string, unknown>) => { p.iconPosition = 'right' })}
              className={`flex-1 px-2 py-1 text-xs rounded ${
                props.iconPosition === 'right'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Direita
            </button>
          </div>
        )}
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Estilo</h4>
        <div className="flex gap-1">
          {(['filled', 'outline', 'ghost'] as const).map((style) => (
            <button
              key={style}
              onClick={() => setProp((p: Record<string, unknown>) => { p.buttonStyle = style })}
              className={`px-3 py-1 text-xs rounded capitalize ${
                props.buttonStyle === style
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {style === 'filled' ? 'Preenchido' : style === 'outline' ? 'Contorno' : 'Fantasma'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Tamanho</h4>
        <div className="flex gap-1">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <button
              key={size}
              onClick={() => setProp((p: Record<string, unknown>) => { p.size = size })}
              className={`px-3 py-1 text-xs rounded uppercase ${
                props.size === size
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Cores</h4>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Fundo</label>
            <ColorInput
              value={props.background || '#2563eb'}
              onChange={(v) => setProp((p: Record<string, unknown>) => { p.background = v })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Texto</label>
            <ColorInput
              value={props.color || '#ffffff'}
              onChange={(v) => setProp((p: Record<string, unknown>) => { p.color = v })}
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Border Radius</h4>
        <input
          type="range"
          min={0}
          max={50}
          value={props.borderRadius || 8}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.borderRadius = parseInt(e.target.value) }, 500)}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.borderRadius}px</span>
      </div>
    </div>
  )
}
