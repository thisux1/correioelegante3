import { Providers } from '@/app/providers'
import { AppRouter } from '@/app/router'
import { SmoothScroll } from '@/components/layout/SmoothScroll'

export function BootLoadingGate() {
  return (
    <>
      <Providers>
        <SmoothScroll>
          <AppRouter />
        </SmoothScroll>
      </Providers>
    </>
  )
}
