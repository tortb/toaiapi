interface AvatarProps {
  name: string
  src?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
}

export function Avatar({ name, src, size = 'md', className = '' }: AvatarProps) {
  const initials = name.slice(0, 1).toUpperCase()

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover ${sizeMap[size]} ${className}`}
      />
    )
  }

  return (
    <div
      className={`rounded-full bg-[var(--accent-light)] text-[var(--accent)] font-semibold flex items-center justify-center ${sizeMap[size]} ${className}`}
    >
      {initials}
    </div>
  )
}
