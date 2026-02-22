import type { ReactNode } from 'react'
import { CustomCursor } from '@/components/animations/CustomCursor'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <>
      <CustomCursor />
      {children}
    </>
  )
}
