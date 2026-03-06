import { useState } from 'react'
import { useNode, type UserComponent } from '@craftjs/core'
import { ImageIcon } from 'lucide-react'
import { ImageSettings } from './ImageSettings'

export type ImageProps = {
  src: string
  alt: string
  width: string
  height: string
  objectFit: 'cover' | 'contain' | 'fill'
  borderRadius: number
  backgroundColor: string
}

const defaultProps: ImageProps = {
  src: '',
  alt: 'Imagem',
  width: '100%',
  height: 'auto',
  objectFit: 'cover',
  borderRadius: 0,
  backgroundColor: 'transparent',
}

export const ImageComponent: UserComponent<Partial<ImageProps>> = (incomingProps) => {
  const props = { ...defaultProps, ...incomingProps }
  const {
    connectors: { connect },
  } = useNode()

  const { src, alt, width, height, objectFit, borderRadius, backgroundColor } = props
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)

  if (!src) {
    return (
      <div
        ref={(ref) => { if (ref) connect(ref) }}
        className="flex flex-col items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 text-gray-400"
        style={{
          width,
          height: height === 'auto' ? '200px' : height,
          borderRadius: `${borderRadius}px`,
        }}
      >
        <ImageIcon className="w-10 h-10 mb-2" />
        <span className="text-sm">Adicione uma URL de imagem</span>
      </div>
    )
  }

  const hasBg = backgroundColor && backgroundColor !== 'transparent'

  const showSkeleton = !imgLoaded && !imgError

  const skeletonOverlay = showSkeleton ? (
    <div
      className="animate-pulse"
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: `${borderRadius}px`,
        background: 'linear-gradient(110deg, #e5e7eb 30%, #f3f4f6 50%, #e5e7eb 70%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite linear',
      }}
    />
  ) : null

  if (hasBg) {
    return (
      <div
        ref={(ref) => { if (ref) connect(ref) }}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor,
          borderRadius: `${borderRadius}px`,
          width,
          height: height === 'auto' ? undefined : height,
          padding: '4px',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        {skeletonOverlay}
        <img
          src={src}
          alt={alt}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit,
            display: 'block',
            opacity: showSkeleton ? 0 : 1,
            transition: 'opacity 0.4s ease-in-out',
          }}
        />
      </div>
    )
  }

  return (
    <div
      ref={(ref) => { if (ref) connect(ref) }}
      style={{
        position: 'relative',
        width,
        height,
        borderRadius: `${borderRadius}px`,
        overflow: 'hidden',
      }}
    >
      {skeletonOverlay}
      <img
        src={src}
        alt={alt}
        onLoad={() => setImgLoaded(true)}
        onError={() => setImgError(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit,
          borderRadius: `${borderRadius}px`,
          display: 'block',
          opacity: showSkeleton ? 0 : 1,
          transition: 'opacity 0.4s ease-in-out',
        }}
      />
    </div>
  )
}

ImageComponent.craft = {
  displayName: 'Imagem',
  props: defaultProps,
  custom: {
    resizable: {
      directions: ['e', 's', 'se'],
      widthProp: 'width',
      heightProp: 'height',
      minWidth: 30,
      minHeight: 30,
    },
  },
  related: {
    settings: ImageSettings,
  },
}
