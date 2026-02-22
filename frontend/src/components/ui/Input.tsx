import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-text-light">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-xl
            bg-white/80 border border-white/40
            backdrop-blur-sm
            text-text placeholder:text-text-muted
            outline-none
            transition-all duration-200
            focus:ring-2 focus:ring-primary/30 focus:border-primary/50
            ${error ? 'border-red-400 focus:ring-red-300' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <span className="text-xs text-red-500">{error}</span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
