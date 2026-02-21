import { ReactLenis } from 'lenis/react'
import type { ReactNode } from 'react'

interface SmoothScrollProps {
    children: ReactNode
}

export function SmoothScroll({ children }: SmoothScrollProps) {
    // Lenis options for "dynamic" feel
    const lenisOptions = {
        duration: 1.0, // Balanced: smooth but responsive, avoids dead-zone overshoot
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Ease Out Expo
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        smoothTouch: true, // Explicitly requested for mobile
        touchMultiplier: 2, // Make touch feel more responsive/faster before inertia kicks in
        infinite: false,
    } as any // Cast due to strict type checking on string literals vs enums

    return (
        <ReactLenis root options={lenisOptions}>
            {children}
        </ReactLenis>
    )
}
