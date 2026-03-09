import { useNode, type UserComponent } from '@craftjs/core'
import { ColorInput } from '../../ColorInput'
import {
  // Básicos
  Star, Heart, CheckCircle, ArrowRight, Lightning, Shield, Trophy, Target,
  Users, Clock, Envelope, Phone, MapPin, Globe, Camera, MusicNote,
  Briefcase, BookOpen, Coffee, Gift, Rocket, ThumbsUp, TrendUp, Eye,
  // Contabilidade e negócios
  Buildings, FileText, CheckSquare, Calculator, Receipt,
  Wallet, CreditCard, Money, Scales, MagnifyingGlass, UserCheck,
  ChartBar, ChartPie, ClipboardText, ListChecks, Bank,
  Table, FolderOpen, Coins, Percent, SealCheck,
  CurrencyDollar, Scroll, PencilSimple, UserGear, Building,
  // Adicionais úteis
  Handshake, Notebook, Invoice, CalendarCheck, ShieldCheck, HandCoins,
  type IconProps as PhosphorIconProps,
} from '@phosphor-icons/react'

// Tipo para componentes Phosphor
type PhosphorIcon = React.ComponentType<PhosphorIconProps>

const ICON_MAP: Record<string, PhosphorIcon> = {
  // Básicos
  star: Star, heart: Heart, check: CheckCircle, arrow: ArrowRight,
  zap: Lightning, shield: Shield, award: Trophy, target: Target,
  users: Users, clock: Clock, mail: Envelope, phone: Phone,
  mappin: MapPin, globe: Globe, camera: Camera, music: MusicNote,
  briefcase: Briefcase, book: BookOpen, coffee: Coffee, gift: Gift,
  rocket: Rocket, thumbsup: ThumbsUp, trending: TrendUp, eye: Eye,
  // Contabilidade e negócios
  building: Buildings, building2: Building, filetext: FileText, filecheck: CheckSquare,
  calculator: Calculator, receipt: Receipt, wallet: Wallet, creditcard: CreditCard,
  banknote: Money, scale: Scales, search: MagnifyingGlass, usercheck: UserCheck,
  barchart: ChartBar, piechart: ChartPie, clipboardcheck: ListChecks,
  clipboardlist: ClipboardText, landmark: Bank, spreadsheet: Table,
  folder: FolderOpen, handcoins: HandCoins, percent: Percent, badgecheck: SealCheck,
  dollar: CurrencyDollar, scroll: Scroll, filepen: PencilSimple, usercog: UserGear,
  // Adicionais
  handshake: Handshake, notebook: Notebook, invoice: Invoice, coins: Coins,
  calendarcheck: CalendarCheck, shieldcheck: ShieldCheck,
}

const ICON_NAMES: Record<string, string> = {
  // Originais
  star: 'Estrela', heart: 'Coração', check: 'Check', arrow: 'Seta',
  zap: 'Raio', shield: 'Escudo', award: 'Troféu', target: 'Alvo',
  users: 'Pessoas', clock: 'Relógio', mail: 'Email', phone: 'Telefone',
  mappin: 'Local', globe: 'Globo', camera: 'Câmera', music: 'Música',
  briefcase: 'Maleta', book: 'Livro', coffee: 'Café', gift: 'Presente',
  rocket: 'Foguete', thumbsup: 'Curtir', trending: 'Tendência', eye: 'Olho',
  // Contabilidade e negócios
  building: 'Prédios', building2: 'Empresa', filetext: 'Documento', filecheck: 'Doc. OK',
  calculator: 'Calculadora', receipt: 'Recibo', wallet: 'Carteira', creditcard: 'Cartão',
  banknote: 'Dinheiro', scale: 'Balança', search: 'Busca', usercheck: 'Usuário OK',
  barchart: 'Gráfico', piechart: 'Pizza', clipboardcheck: 'Lista OK',
  clipboardlist: 'Lista', landmark: 'Banco', spreadsheet: 'Planilha',
  folder: 'Pasta', handcoins: 'Moedas', percent: '%', badgecheck: 'Verificado',
  dollar: 'Dólar', scroll: 'Pergaminho', filepen: 'Editar', usercog: 'Config',
  // Adicionais
  handshake: 'Acordo', notebook: 'Caderno', invoice: 'Nota Fiscal', coins: 'Moedas',
  calendarcheck: 'Agenda OK', shieldcheck: 'Seguro',
}

export type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'
export type IconShape = 'none' | 'circle' | 'square' | 'rounded'

export type IconProps = {
  icon: string
  size: number
  color: string
  secondaryColor?: string // Cor secundária para duotone
  backgroundColor: string
  shape: IconShape
  padding: number
  weight: IconWeight
}

const defaultProps: IconProps = {
  icon: 'star',
  size: 32,
  color: '#2563eb',
  secondaryColor: '', // Se vazio, usa opacidade da cor principal
  backgroundColor: '#eff6ff',
  shape: 'rounded',
  padding: 16,
  weight: 'duotone',
}

const IconSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }))

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Ícone</h4>
        <div className="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto">
          {Object.entries(ICON_MAP).map(([key, Icon]) => (
            <button
              key={key}
              onClick={() => setProp((p: Record<string, unknown>) => { p.icon = key })}
              className={`p-1.5 rounded flex items-center justify-center ${
                props.icon === key
                  ? 'bg-blue-100 text-blue-600 ring-1 ring-blue-400'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
              title={ICON_NAMES[key]}
            >
              <Icon size={16} weight="duotone" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Estilo</h4>
        <div className="flex flex-wrap gap-1">
          {(['thin', 'light', 'regular', 'bold', 'fill', 'duotone'] as const).map((w) => (
            <button
              key={w}
              onClick={() => setProp((p: Record<string, unknown>) => { p.weight = w })}
              className={`px-2 py-1 text-xs rounded capitalize ${
                props.weight === w
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400">Tamanho (px)</label>
        <input
          type="range" min={16} max={80}
          value={props.size || 32}
          onChange={(e) => setProp((p: Record<string, unknown>) => { p.size = parseInt(e.target.value) }, 500)}
          className="w-full"
        />
        <span className="text-xs text-gray-400">{props.size}px</span>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Formato</h4>
        <div className="flex gap-1">
          {(['none', 'circle', 'square', 'rounded'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setProp((p: Record<string, unknown>) => { p.shape = s })}
              className={`px-2 py-1 text-xs rounded ${
                props.shape === s
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'none' ? 'Nenhum' : s === 'circle' ? 'Círculo' : s === 'square' ? 'Quadrado' : 'Arredondado'}
            </button>
          ))}
        </div>
      </div>

      {props.shape !== 'none' && (
        <div>
          <label className="text-xs text-gray-400">Padding (px)</label>
          <input
            type="range" min={4} max={32}
            value={props.padding || 16}
            onChange={(e) => setProp((p: Record<string, unknown>) => { p.padding = parseInt(e.target.value) }, 500)}
            className="w-full"
          />
          <span className="text-xs text-gray-400">{props.padding}px</span>
        </div>
      )}

      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Cores</h4>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-400">Cor Principal</label>
            <ColorInput
              value={props.color || '#2563eb'}
              onChange={(v) => setProp((p: Record<string, unknown>) => { p.color = v })}
            />
          </div>
          {props.weight === 'duotone' && (
            <div>
              <label className="text-xs text-gray-400">Cor Secundária (duotone)</label>
              <ColorInput
                value={props.secondaryColor || ''}
                onChange={(v) => setProp((p: Record<string, unknown>) => { p.secondaryColor = v })}
              />
              <span className="text-xs text-gray-400">Deixe vazio para usar opacidade automática</span>
            </div>
          )}
          {props.shape !== 'none' && (
            <div>
              <label className="text-xs text-gray-400">Fundo</label>
              <ColorInput
                value={props.backgroundColor || '#eff6ff'}
                onChange={(v) => setProp((p: Record<string, unknown>) => { p.backgroundColor = v })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const IconComponent: UserComponent<Partial<IconProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const { connectors: { connect } } = useNode()

  const { icon, size, color, secondaryColor, backgroundColor, shape, padding, weight } = props
  const Icon = ICON_MAP[icon] || Star

  const borderRadius = shape === 'circle' ? '50%' : shape === 'rounded' ? '12px' : shape === 'square' ? '4px' : undefined
  const totalSize = shape !== 'none' ? size + padding * 2 : size

  // Estilo CSS para duotone - Phosphor usa CSS variables
  const duotoneStyle: React.CSSProperties = weight === 'duotone' && secondaryColor
    ? { '--ph-duotone-opacity': '1', '--ph-duotone-fill': secondaryColor } as React.CSSProperties
    : {}

  return (
    <div
      ref={(ref) => { if (ref) connect(ref) }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${totalSize}px`,
        height: `${totalSize}px`,
        minWidth: `${totalSize}px`,
        minHeight: `${totalSize}px`,
        backgroundColor: shape !== 'none' ? backgroundColor : 'transparent',
        borderRadius,
        color,
        ...duotoneStyle,
      }}
    >
      <Icon size={size} weight={weight} />
    </div>
  )
}

IconComponent.craft = {
  displayName: 'Ícone',
  props: defaultProps,
  rules: {
    canMoveIn: () => false,
  },
  related: {
    settings: IconSettings,
  },
}
