import { useNode, type UserComponent } from '@craftjs/core'
import { VideoSettings } from './VideoSettings'

export type VideoProps = {
  url: string
  width: string
  height: string
  borderRadius: number
  background: string
}

const defaultProps: VideoProps = {
  url: '',
  width: '100%',
  height: '400px',
  borderRadius: 12,
  background: '#0f172a',
}

function getEmbedUrl(url: string): string | null {
  if (!url) return null
  try {
    const parsed = new URL(url)

    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`

    // Already an embed URL
    if (parsed.hostname.includes('youtube.com/embed') || parsed.hostname.includes('player.vimeo.com')) {
      return url
    }
  } catch {
    // ignore invalid URLs
  }
  return null
}

export const VideoComponent: UserComponent<Partial<VideoProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const {
    connectors: { connect },
  } = useNode()

  const embedUrl = getEmbedUrl(props.url)

  return (
    <div
      ref={(ref) => { if (ref) connect(ref) }}
      style={{
        width: props.width,
        height: props.height,
        borderRadius: `${props.borderRadius}px`,
        overflow: 'hidden',
        background: props.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {embedUrl ? (
        <iframe
          src={embedUrl}
          style={{ width: '100%', height: '100%', border: 'none' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Video"
        />
      ) : (
        // Placeholder com ícone de play quando sem URL
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Play icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <span style={{ fontSize: '13px', opacity: 0.7 }}>
            Adicione a URL do vídeo nas configurações
          </span>
        </div>
      )}
    </div>
  )
}

VideoComponent.craft = {
  displayName: 'Video',
  props: defaultProps,
  rules: {
    canDrag: () => true,
  },
  related: {
    settings: VideoSettings,
  },
}
