// ============================================
// FILE 2: src/components/common/Input.jsx
// ============================================
import { forwardRef } from 'react'

const Input = forwardRef(
  (
    {
      id,
      label,
      error,
      type = 'text',
      className = '',
      required = false,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name || undefined
    const describedBy = error ? `${inputId}-error` : undefined

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}

        <input
          id={inputId}
          ref={ref}
          type={type}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          required={required}
          className={[
            'w-full px-4 py-2 border border-slate-300 rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'disabled:bg-slate-100 disabled:cursor-not-allowed',
            'transition-colors duration-200',
            error ? 'border-red-500 focus:ring-red-500' : '',
            className,
          ].join(' ')}
          {...props}
        />

        {error && (
          <p id={describedBy} className="mt-1 text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
