import { useRef } from 'react'


interface ScrollSectionProps {
    children: React.ReactNode
    className?: string
    id?: string
}

export function ScrollSection({ children, className, id }: ScrollSectionProps) {
    const ref = useRef<HTMLDivElement>(null)

    // Simple check for when the section is in view to trigger animations if needed purely by scroll position
    // But usually children will handle their own "whileInView".
    // This wrapper mainly provides the consistent spacing and "stage".

    return (
        <section
            ref={ref}
            id={id}
            className={`relative w-full min-h-[50vh] flex flex-col items-center justify-center py-32 md:py-48 ${className || ''}`}
        >
            {/* 
         No background here. 
         The Global BackgroundField handles the visuals. 
         This just positions the content.
      */}
            <div className="relative w-full z-10">
                {children}
            </div>
        </section>
    )
}
