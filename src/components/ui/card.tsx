import * as React from 'react'

import { cn } from '@/lib/utils'

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border bg-card text-card-foreground shadow brutal:shadow-[var(--shadow-brutal)] brutal:border-2',
        className,
      )}
      {...props}
    />
  ),
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  ),
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  ),
)
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  ),
)
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  ),
)
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  ),
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

// PersonaCard: A high-emphasis layout tailored for persona display.
// Title shows the keyword, body shows the reasoning, and an optional image sits to the side.
type PersonaCardProps = React.HTMLAttributes<HTMLDivElement> & {
  keyword: string
  reasoning: string
  imageUrl?: string
  imageAlt?: string
  subtitle?: string
  imageSide?: 'left' | 'right'
}

const PersonaCard = React.forwardRef<HTMLDivElement, PersonaCardProps>(
  (
    { className, keyword, reasoning, imageUrl, imageAlt, subtitle, imageSide = 'left', ...props },
    ref,
  ) => {
    const ImageBlock = (
      <div className="relative h-[200px] w-full md:h-auto">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={imageAlt || keyword}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/10" />
        )}
      </div>
    )

    return (
      <div
        ref={ref}
        className={cn(
          'grid overflow-hidden rounded-2xl border bg-card text-card-foreground shadow brutal:shadow-[var(--shadow-brutal)] brutal:border-2 md:grid-cols-[260px_1fr]',
          className,
        )}
        {...props}
      >
        {imageSide === 'left' && ImageBlock}
        <div className="p-5 md:p-6">
          <div className="space-y-2">
            <div className="text-2xl font-bold leading-tight tracking-tight md:text-3xl">
              {keyword}
            </div>
            {subtitle ? (
              <div className="text-base text-muted-foreground md:text-lg">{subtitle}</div>
            ) : null}
          </div>
          <div className="mt-4 text-sm leading-relaxed md:mt-5 md:text-base">{reasoning}</div>
        </div>
        {imageSide === 'right' && ImageBlock}
      </div>
    )
  },
)
PersonaCard.displayName = 'PersonaCard'

export { PersonaCard }
