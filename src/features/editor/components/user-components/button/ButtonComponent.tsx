import { useNode, type UserComponent } from '@craftjs/core'
import { ButtonSettings } from './ButtonSettings'

export type ButtonProps = {
  text: string
  href: string
  buttonStyle: 'filled' | 'outline' | 'ghost'
  size: 'sm' | 'md' | 'lg'
  background: string
  color: string
  borderRadius: number
}

const defaultProps: ButtonProps = {
  text: 'Clique Aqui',
  href: '#',
  buttonStyle: 'filled',
  size: 'md',
  background: '#2563eb',
  color: '#ffffff',
  borderRadius: 8,
}

const sizeStyles = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-6 py-2.5 text-base',
  lg: 'px-8 py-3.5 text-lg',
}

export const ButtonComponent: UserComponent<Partial<ButtonProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const {
    connectors: { connect },
  } = useNode()

  const { text, buttonStyle, size, background, color, borderRadius } = props

  const baseClasses = `inline-block font-medium transition-colors cursor-pointer ${sizeStyles[size]}`

  const styleProps: React.CSSProperties = {
    borderRadius: `${borderRadius}px`,
    ...(buttonStyle === 'filled'
      ? { background, color, border: 'none' }
      : buttonStyle === 'outline'
        ? { background: 'transparent', color: background, border: `2px solid ${background}` }
        : { background: 'transparent', color: background, border: 'none' }),
  }

  return (
    <button
      ref={(ref) => { if (ref) connect(ref) }}
      className={baseClasses}
      style={styleProps}
    >
      {text}
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
