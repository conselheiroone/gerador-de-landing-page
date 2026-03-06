import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          className={cn(
            'flex min-h-[80px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-base text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/10',
            className,
          )}
          ref={ref}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        ) : null}
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'

export { Textarea }
