import { useNode, type UserComponent } from '@craftjs/core'
import { NavbarSettings } from './NavbarSettings'

export interface NavLink {
  label: string
  href: string
}

export type NavbarProps = {
  background: string
  logoText: string
  logoSrc: string
  /** Largura máxima do logo em px (ex: 120). Default: auto (altura controla) */
  logoWidth?: number
  /** Altura do logo em px (ex: 48). Default: 44 */
  logoHeight?: number
  /** Cor de fundo atrás do logo (ex: '#ffffff'). Default: 'transparent' */
  logoBg?: string
  /** Formato do container do logo: 'pill' (retângulo arredondado) ou 'circle' (avatar) ou 'dropdown' (estilo pendurado). Default: 'pill' */
  logoShape?: 'pill' | 'circle' | 'dropdown'
  /** Mostrar nome da empresa ao lado do logo. Default: false */
  showLogoText?: boolean
  links: NavLink[]
  ctaText: string
  ctaBg: string
  ctaColor: string
  linkColor: string
  paddingX: number
  paddingY: number
  backdropBlur: number
  borderBottom: string
  ctaBorderRadius: number
  linkFontSize: number
  /** Max-width do conteúdo interno (bg fica full-width). Ex: '1080px' */
  contentMaxWidth?: string
}

const defaultProps: NavbarProps = {
  background: '#0f172a',
  logoText: 'Logo',
  logoSrc: '',
  links: [
    { label: 'Início', href: '#' },
    { label: 'Sobre', href: '#' },
    { label: 'Serviços', href: '#' },
    { label: 'Contato', href: '#' },
  ],
  ctaText: 'Contato',
  ctaBg: '#f97316',
  ctaColor: '#ffffff',
  linkColor: '#ffffff',
  paddingX: 40,
  paddingY: 16,
  backdropBlur: 0,
  borderBottom: 'none',
  ctaBorderRadius: 8,
  linkFontSize: 14,
}

export const NavbarComponent: UserComponent<Partial<NavbarProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const {
    connectors: { connect },
  } = useNode()

  const hasLogo = !!(props.logoSrc || props.logoText)
  const hasBlur = props.backdropBlur > 0

  const content = (
    <>
      {/* Logo — hidden when both logoSrc and logoText are empty */}
      {hasLogo && (
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, gap: '10px' }}>
          {props.logoSrc ? (
            <>
              {(() => {
                const hasBg = props.logoBg && props.logoBg !== 'transparent'
                const isCircle = props.logoShape === 'circle'
                const isDropdown = props.logoShape === 'dropdown'
                const h = props.logoHeight || 44
                const containerSize = isCircle ? h + 8 : undefined

                // Estilo "dropdown" — container branco que "pende" do navbar
                if (isDropdown) {
                  return (
                    <div style={{
                      backgroundColor: props.logoBg || '#ffffff',
                      borderRadius: '0 0 12px 12px',
                      padding: '12px 24px',
                      marginTop: `-${props.paddingY}px`,
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      alignSelf: 'flex-start',
                    }}>
                      <img
                        src={props.logoSrc}
                        alt={props.logoText}
                        style={{
                          width: props.logoWidth ? `${props.logoWidth}px` : '180px',
                          height: 'auto',
                          maxWidth: '100%',
                          objectFit: 'contain',
                          display: 'block',
                        }}
                      />
                    </div>
                  )
                }

                return (
                  <div style={{
                    backgroundColor: hasBg ? props.logoBg : 'transparent',
                    borderRadius: isCircle ? '50%' : (hasBg ? '8px' : undefined),
                    padding: isCircle ? '0' : (hasBg ? '6px 10px' : undefined),
                    width: isCircle && hasBg ? `${containerSize}px` : undefined,
                    height: isCircle && hasBg ? `${containerSize}px` : undefined,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}>
                    <img
                      src={props.logoSrc}
                      alt={props.logoText}
                      style={{
                        height: `${h}px`,
                        width: isCircle ? `${h}px` : (props.logoWidth ? `${props.logoWidth}px` : 'auto'),
                        maxWidth: isCircle ? undefined : '200px',
                        objectFit: isCircle ? 'cover' : 'contain',
                        display: 'block',
                        borderRadius: isCircle && !hasBg ? '50%' : undefined,
                      }}
                    />
                  </div>
                )
              })()}
              {props.showLogoText && props.logoText && (
                <span style={{
                  color: props.linkColor,
                  fontWeight: '700',
                  fontSize: 'clamp(14px, 2.5vw, 18px)',
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap',
                }}>
                  {props.logoText}
                </span>
              )}
            </>
          ) : (
            <span
              style={{
                color: props.linkColor,
                fontWeight: '700',
                fontSize: 'clamp(16px, 3vw, 20px)',
                letterSpacing: '-0.02em',
              }}
            >
              {props.logoText}
            </span>
          )}
        </div>
      )}

      {/* Nav links */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'clamp(8px, 2.5vw, 32px)',
        justifyContent: 'center',
        ...(hasLogo ? { flex: '1 1 auto', minWidth: '0' } : {}),
      }}>
        {props.links.map((link, i) => (
          <a
            key={i}
            href={link.href}
            style={{
              color: props.linkColor,
              fontSize: `clamp(11px, 2.5vw, ${props.linkFontSize}px)`,
              fontWeight: '500',
              textDecoration: 'none',
              letterSpacing: '0.3px',
              whiteSpace: 'nowrap',
              transition: 'opacity 0.2s',
            }}
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* CTA button */}
      {props.ctaText && (
        <button
          style={{
            background: props.ctaBg,
            color: props.ctaColor,
            border: 'none',
            borderRadius: `${props.ctaBorderRadius}px`,
            padding: 'clamp(7px, 1.8vw, 11px) clamp(12px, 3vw, 24px)',
            fontSize: `clamp(11px, 2.5vw, ${props.linkFontSize}px)`,
            fontWeight: '600',
            cursor: 'pointer',
            flexShrink: 0,
            whiteSpace: 'nowrap',
            letterSpacing: '0.2px',
            transition: 'opacity 0.2s',
          }}
        >
          {props.ctaText}
        </button>
      )}
    </>
  )

  const flexStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: hasLogo ? 'space-between' : 'center',
    flexWrap: 'wrap',
    gap: `clamp(6px, 1.5vw, ${props.paddingY}px) clamp(10px, 3vw, ${hasLogo ? 16 : 40}px)`,
  }

  return (
    <nav
      ref={(ref) => { if (ref) connect(ref) }}
      style={{
        width: '100%',
        background: props.background,
        padding: `clamp(10px, 2vw, ${props.paddingY}px) clamp(12px, 4vw, ${props.paddingX}px)`,
        boxSizing: 'border-box',
        ...(hasBlur ? { backdropFilter: `blur(${props.backdropBlur}px)`, WebkitBackdropFilter: `blur(${props.backdropBlur}px)` } : {}),
        borderBottom: props.borderBottom,
        ...(props.contentMaxWidth ? {} : flexStyles),
      }}
    >
      {props.contentMaxWidth ? (
        <div style={{ ...flexStyles, maxWidth: props.contentMaxWidth, margin: '0 auto', width: '100%' }}>
          {content}
        </div>
      ) : content}
    </nav>
  )
}

NavbarComponent.craft = {
  displayName: 'Navbar',
  props: defaultProps,
  rules: {
    canDrag: () => true,
  },
  related: {
    settings: NavbarSettings,
  },
}
