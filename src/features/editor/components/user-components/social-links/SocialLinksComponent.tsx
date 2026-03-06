import { useNode, type UserComponent } from '@craftjs/core'
import { SocialLinksSettings } from './SocialLinksSettings'

export interface SocialLink {
  platform: 'instagram' | 'facebook' | 'linkedin' | 'youtube' | 'twitter' | 'site'
  url: string
}

export type SocialLinksProps = {
  links: SocialLink[]
  iconColor: string
  iconSize: number
  gap: number
  justifyContent: 'center' | 'flex-start' | 'flex-end'
}

const SOCIAL_ICONS: Record<SocialLink['platform'], string> = {
  instagram:
    'M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
  facebook:
    'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2z',
  linkedin:
    'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2V9zm2-6a2 2 0 1 1 0 4 2 2 0 0 1 0-4z',
  youtube:
    'M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.35 29 29 0 0 0-.46-5.33zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z',
  twitter:
    'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  site:
    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
}

const SOCIAL_LABELS: Record<SocialLink['platform'], string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  twitter: 'X (Twitter)',
  site: 'Site',
}

const defaultProps: SocialLinksProps = {
  links: [
    { platform: 'instagram', url: '#' },
    { platform: 'facebook', url: '#' },
    { platform: 'linkedin', url: '#' },
  ],
  iconColor: '#9ca3af',
  iconSize: 22,
  gap: 16,
  justifyContent: 'center',
}

export const SocialLinksComponent: UserComponent<Partial<SocialLinksProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const {
    connectors: { connect, drag },
  } = useNode()

  const { links, iconColor, iconSize, gap, justifyContent } = props

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)) }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent,
        gap: `${gap}px`,
        flexWrap: 'wrap',
        width: '100%',
      }}
    >
      {links.map((link, i) => (
        <a
          key={i}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          title={SOCIAL_LABELS[link.platform]}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: iconColor,
            transition: 'opacity 0.2s',
            opacity: 0.8,
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.8' }}
        >
          <svg
            width={iconSize}
            height={iconSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={SOCIAL_ICONS[link.platform]} />
          </svg>
        </a>
      ))}
    </div>
  )
}

SocialLinksComponent.craft = {
  displayName: 'Redes Sociais',
  props: defaultProps,
  rules: {
    canDrag: () => true,
    canMoveIn: () => false,
  },
  related: {
    settings: SocialLinksSettings,
  },
}

export { SOCIAL_ICONS, SOCIAL_LABELS }
