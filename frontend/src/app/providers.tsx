import { ReactNode } from 'react'
import { useLenis } from '@/hooks/useLenis'
import { CustomCursor } from '@/components/animations/CustomCursor'
import { ScrollProgress } from '@/components/animations/ScrollProgress'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  useLenis()

  return (
    <>
      <ScrollProgress />
      <CustomCursor />
      {children}
    </>
  )
}
