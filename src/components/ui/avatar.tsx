import { cn } from '@/lib/utils'

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null
  alt?: string
  fallback: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
}

function Avatar({ src, alt, fallback, size = 'md', className, ...props }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt ?? fallback}
        className={cn(
          'rounded-full object-cover',
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-brand-500 font-semibold text-white',
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {fallback.charAt(0).toUpperCase()}
    </div>
  )
}

export { Avatar }
