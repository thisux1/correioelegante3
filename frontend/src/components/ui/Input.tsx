import { type InputHTMLAttributes, type ReactNode, forwardRef } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  rightElement?: ReactNode
  containerClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightElement, className = '', containerClassName = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-light flex items-center justify-between">
            <span>{label}</span>
            {hint && <span className="text-xs text-text-muted font-normal">{hint}</span>}
          </label>
        )}
        <div className="relative flex items-center group">
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-primary pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`
              w-full px-4 py-3 rounded-xl
              bg-white/85 border border-white/60
              shadow-[0_2px_10px_rgba(0,0,0,0.02)]
              backdrop-blur-md
              text-text placeholder:text-text-muted/70 text-sm md:text-base
              outline-none
              transition-all duration-200
              focus:ring-2 focus:ring-primary/25 focus:border-primary/60 focus:bg-white
              ${leftIcon ? 'pl-11' : ''}
              ${rightElement ? 'pr-11' : ''}
              ${error ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500 bg-rose-50/30' : ''}
              ${className}
            `}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-text-muted">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <span className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-0.5">
            {error}
          </span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

