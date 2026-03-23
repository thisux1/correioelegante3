import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Providers } from '@/app/providers'
import { AppRouter } from '@/app/router'
import { SmoothScroll } from '@/components/layout/SmoothScroll'

const BOOT_MIN_DURATION_MS = 380
const BOOT_FAIL_OPEN_MS = 1200

export function BootLoadingGate() {
  const [showBoot, setShowBoot] = useState(true)

  useEffect(() => {
    const startedAt = performance.now()
    let closed = false

    const closeBoot = () => {
      if (closed) return
      closed = true
      const elapsed = performance.now() - startedAt
      const remaining = Math.max(0, BOOT_MIN_DURATION_MS - elapsed)
      window.setTimeout(() => setShowBoot(false), remaining)
    }

    const failOpenTimer = window.setTimeout(closeBoot, BOOT_FAIL_OPEN_MS)

    if (document.readyState === 'complete') {
      closeBoot()
    } else {
      window.addEventListener('load', closeBoot, { once: true })
    }

    return () => {
      window.clearTimeout(failOpenTimer)
      window.removeEventListener('load', closeBoot)
    }
  }, [])

  return (
    <>
      <Providers>
        <SmoothScroll>
          <AppRouter />
        </SmoothScroll>
      </Providers>

      <AnimatePresence>
        {showBoot && (
          <motion.div
            key="boot-loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.19, 1, 0.22, 1] }}
            className="fixed inset-0 z-[9997] flex items-center justify-center bg-gradient-to-b from-background via-background to-primary/10"
            aria-label="Carregando aplicativo"
            role="status"
            aria-live="polite"
          >
            <div className="glass rounded-2xl px-6 py-5 shadow-xl shadow-primary/10">
              <div className="flex items-center gap-3" data-no-ink="true">
                <span
                  className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse"
                  aria-hidden="true"
                />
                <p className="font-sans text-sm text-text-light">Preparando seu correio elegante...</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
