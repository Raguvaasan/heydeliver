import { FC, InputHTMLAttributes } from "react"
import { useField } from "formik"

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string
  label: string
  helperText?: string
  icon?: React.ReactNode
  required?: boolean
}

/**
 * Modern form input with Formik integration
 * Features: Floating label, error states, icons, accessibility
 */
export const FormInput: FC<FormInputProps> = ({
  name,
  label,
  helperText,
  icon,
  required = false,
  className = "",
  ...props
}) => {
  const [field, meta] = useField(name)
  const hasError = meta.touched && meta.error

  return (
    <div className="relative">
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            {icon}
          </div>
        )}
        <input
          {...field}
          {...props}
          id={name}
          className={`
            peer w-full px-4 py-3 
            ${icon ? 'pl-10' : ''} 
            border-2 rounded-lg
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-white
            placeholder-transparent
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-0
            ${hasError 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
              : 'border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-200'
            }
            disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed
            ${className}
          `}
          placeholder={label}
        />
        <label
          htmlFor={name}
          className={`
            absolute left-4 ${icon ? 'left-10' : 'left-4'} -top-2.5 px-1
            bg-white dark:bg-gray-800
            text-sm font-medium
            transition-all duration-200
            peer-placeholder-shown:text-base peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400
            peer-focus:-top-2.5 peer-focus:text-sm
            ${hasError 
              ? 'text-red-600 dark:text-red-400 peer-focus:text-red-600' 
              : 'text-gray-700 dark:text-gray-300 peer-focus:text-orange-600'
            }
          `}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>

      {/* Error Message */}
      {hasError && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-slide-down">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {meta.error}
        </p>
      )}

      {/* Helper Text */}
      {!hasError && helperText && (
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  )
}

interface FormTextareaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  name: string
  label: string
  helperText?: string
  rows?: number
  required?: boolean
}

export const FormTextarea: FC<FormTextareaProps> = ({
  name,
  label,
  helperText,
  rows = 4,
  required = false,
  className = "",
  ...props
}) => {
  const [field, meta] = useField(name)
  const hasError = meta.touched && meta.error

  return (
    <div className="relative">
      <div className="relative">
        <textarea
          {...field}
          {...(props as any)}
          id={name}
          rows={rows}
          className={`
            peer w-full px-4 py-3 
            border-2 rounded-lg
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-white
            placeholder-transparent
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-0
            resize-y
            ${hasError 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
              : 'border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-200'
            }
            disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed
            ${className}
          `}
          placeholder={label}
        />
        <label
          htmlFor={name}
          className={`
            absolute left-4 -top-2.5 px-1
            bg-white dark:bg-gray-800
            text-sm font-medium
            transition-all duration-200
            peer-placeholder-shown:text-base peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400
            peer-focus:-top-2.5 peer-focus:text-sm
            ${hasError 
              ? 'text-red-600 dark:text-red-400 peer-focus:text-red-600' 
              : 'text-gray-700 dark:text-gray-300 peer-focus:text-orange-600'
            }
          `}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>

      {hasError && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-slide-down">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {meta.error}
        </p>
      )}

      {!hasError && helperText && (
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  )
}

interface FormSelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  name: string
  label: string
  options: { value: string; label: string }[]
  helperText?: string
  icon?: React.ReactNode
  required?: boolean
}

export const FormSelect: FC<FormSelectProps> = ({
  name,
  label,
  options,
  helperText,
  icon,
  required = false,
  className = "",
  ...props
}) => {
  const [field, meta] = useField(name)
  const hasError = meta.touched && meta.error

  return (
    <div className="relative">
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 z-10">
            {icon}
          </div>
        )}
        <select
          {...field}
          {...(props as any)}
          id={name}
          className={`
            peer w-full px-4 py-3 
            ${icon ? 'pl-10' : ''} 
            border-2 rounded-lg
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-white
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-0
            appearance-none cursor-pointer
            ${hasError 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
              : 'border-gray-300 dark:border-gray-600 focus:border-orange-500 focus:ring-orange-200'
            }
            disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed
            ${className}
          `}
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Dropdown Arrow */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <label
          htmlFor={name}
          className={`
            absolute left-4 ${icon ? 'left-10' : 'left-4'} -top-2.5 px-1
            bg-white dark:bg-gray-800
            text-sm font-medium
            transition-all duration-200
            ${hasError 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-gray-700 dark:text-gray-300'
            }
          `}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>

      {hasError && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-slide-down">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {meta.error}
        </p>
      )}

      {!hasError && helperText && (
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  )
}

// Add animation to tailwind.config.cjs if not present:
// animation: {
//   'slide-down': 'slideDown 0.2s ease-out',
// },
// keyframes: {
//   slideDown: {
//     '0%': { opacity: '0', transform: 'translateY(-10px)' },
//     '100%': { opacity: '1', transform: 'translateY(0)' },
//   },
// }
