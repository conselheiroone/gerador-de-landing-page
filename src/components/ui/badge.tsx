import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
  {
    variants: {
      variant: {
        primary: 'bg-brand-100 text-brand-800',
        secondary: 'bg-gray-100 text-gray-700',
        warning: 'bg-amber-100 text-amber-800',
        error: 'bg-red-100 text-red-800',
        success: 'bg-green-100 text-green-800',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
