import { useNode, type UserComponent } from '@craftjs/core'
import { ButtonSettings } from './ButtonSettings'
import {
  WhatsappLogo, Phone, Envelope, ArrowRight, Download, Play,
  ShoppingCart, Heart, Star, Check, Plus, PaperPlaneTilt,
  type IconProps as PhosphorIconProps,
} from '@phosphor-icons/react'

// Mapa de ícones disponíveis para botões
type PhosphorIcon = React.ComponentType<PhosphorIconProps>

const BUTTON_ICONS: Record<string, PhosphorIcon> = {
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

export const BUTTON_ICON_NAMES: Record<string, string> = {
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

export type ButtonProps = {
  text: string
  href: string
  buttonStyle: 'filled' | 'outline' | 'ghost'
  size: 'sm' | 'md' | 'lg'
  background: string
  color: string
  borderRadius: number
  icon?: string
  iconPosition?: 'left' | 'right'
  paddingX?: number
  paddingY?: number
  shadow?: string
}

const defaultProps: ButtonProps = {
  text: 'Clique Aqui',
  href: '#',
  buttonStyle: 'filled',
  size: 'md',
  background: '#2563eb',
  color: '#ffffff',
  borderRadius: 8,
  icon: '',
  iconPosition: 'left',
}

const sizeConfig = {
  sm: { padding: 'px-4 py-1.5', text: 'text-sm', iconSize: 16, gap: 6 },
  md: { padding: 'px-6 py-2.5', text: 'text-base', iconSize: 18, gap: 8 },
  lg: { padding: 'px-8 py-3.5', text: 'text-lg', iconSize: 22, gap: 10 },
}

export const ButtonComponent: UserComponent<Partial<ButtonProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const {
    connectors: { connect },
  } = useNode()

  const { text, buttonStyle, size, background, color, borderRadius, icon, iconPosition, paddingX, paddingY, shadow } = props
  const config = sizeConfig[size]

  const Icon = icon ? BUTTON_ICONS[icon] : null

  const baseClasses = `inline-flex items-center justify-center font-semibold transition-all cursor-pointer ${config.text}`

  const styleProps: React.CSSProperties = {
    borderRadius: `${borderRadius}px`,
    gap: `${config.gap}px`,
    paddingLeft: paddingX ? `${paddingX}px` : undefined,
    paddingRight: paddingX ? `${paddingX}px` : undefined,
    paddingTop: paddingY ? `${paddingY}px` : undefined,
    paddingBottom: paddingY ? `${paddingY}px` : undefined,
    boxShadow: shadow || undefined,
    ...(buttonStyle === 'filled'
      ? { background, color, border: 'none' }
      : buttonStyle === 'outline'
        ? { background: 'transparent', color: background, border: `2px solid ${background}` }
        : { background: 'transparent', color: background, border: 'none' }),
  }

  // Classes de padding só se não tiver paddingX/paddingY customizado
  const paddingClasses = (!paddingX && !paddingY) ? config.padding : ''

  return (
    <button
      ref={(ref) => { if (ref) connect(ref) }}
      className={`${baseClasses} ${paddingClasses}`}
      style={styleProps}
    >
      {Icon && iconPosition === 'left' && <Icon size={config.iconSize} weight="regular" />}
      {text}
      {Icon && iconPosition === 'right' && <Icon size={config.iconSize} weight="regular" />}
    </button>
  )
}

ButtonComponent.craft = {
  displayName: 'Botão',
  props: defaultProps,
  related: {
    settings: ButtonSettings,
  },
}
