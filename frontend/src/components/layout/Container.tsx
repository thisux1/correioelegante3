import { type ReactNode } from 'react'

type ContainerSize = 'narrow' | 'default' | 'wide'

interface ContainerProps {
  children: ReactNode
  size?: ContainerSize
  className?: string
}

const sizeClasses: Record<ContainerSize, string> = {
  narrow: 'max-w-4xl',
  default: 'max-w-7xl',
  wide: 'max-w-screen-2xl',
}

export function Container({ children, size = 'default', className = '' }: ContainerProps) {
  return (
    <div
      className={`w-full mx-auto px-4 sm:px-6 lg:px-8 ${sizeClasses[size]} ${className}`.trim()}
    >
      {children}
    </div>
  )
}
