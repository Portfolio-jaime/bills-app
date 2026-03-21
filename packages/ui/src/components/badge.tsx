import * as React from 'react'
import { cn } from '../lib/utils'

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'income' | 'expense' | 'transfer' | 'outline'
  }
>(({ className, variant = 'default', ...props }, ref) => {
  const variantClasses = {
    default: 'bg-secondary text-secondary-foreground',
    income: 'bg-emerald-900/50 text-emerald-400 border border-emerald-800',
    expense: 'bg-rose-900/50 text-rose-400 border border-rose-800',
    transfer: 'bg-blue-900/50 text-blue-400 border border-blue-800',
    outline: 'border border-input bg-background text-foreground',
  }
  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  )
})
Badge.displayName = 'Badge'

export { Badge }
