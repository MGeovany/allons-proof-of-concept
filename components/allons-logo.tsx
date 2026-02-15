interface AllonsLogoProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'white' | 'orange'
}

export function AllonsLogo({ size = 'md', variant = 'white' }: AllonsLogoProps) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-5xl',
    lg: 'text-7xl',
  }

  const colorClass = variant === 'orange' ? 'text-primary' : 'text-foreground'

  return (
    <h1 className={`${sizeClasses[size]} ${colorClass} font-bold tracking-tight`}>
      {'Al'}
      <span className="inline-block w-[0.05em]" />
      {'|ons'}
    </h1>
  )
}
