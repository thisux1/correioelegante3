import type { ReactNode } from 'react'
import { useLenis } from '@/hooks/useLenis'
import { CustomCursor } from '@/components/animations/CustomCursor'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  useLenis()

  return (
    <>
      <CustomCursor />
      {children}
    </>
  )
}
