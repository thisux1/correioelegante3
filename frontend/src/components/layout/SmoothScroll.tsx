import { ReactLenis } from 'lenis/react'
import type { ComponentProps, ReactNode } from 'react'

interface SmoothScrollProps {
    children: ReactNode
}

export function SmoothScroll({ children }: SmoothScrollProps) {
    type LenisOptions = NonNullable<ComponentProps<typeof ReactLenis>['options']>
    // Lenis options for "dynamic" feel
    const lenisOptions: LenisOptions = {
        duration: 1.0, // Balanced: smooth but responsive, avoids dead-zone overshoot
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Ease Out Expo
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        syncTouch: true, // Explicitly requested for mobile
        touchMultiplier: 2, // Make touch feel more responsive/faster before inertia kicks in
        infinite: false,
    }

    return (
        <ReactLenis root options={lenisOptions}>
            {children}
        </ReactLenis>
    )
}
