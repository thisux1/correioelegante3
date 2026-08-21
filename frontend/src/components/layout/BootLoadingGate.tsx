import { Providers } from '@/app/providers'
import { AppRouter } from '@/app/router'

export function BootLoadingGate() {
  return (
    <Providers>
      <AppRouter />
    </Providers>
  )
}
