import { FC } from "react"
import { Button } from "flowbite-react"

interface SaveButtonProps {
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  type?: "button" | "submit" | "reset"
  children: React.ReactNode
  className?: string
}

/**
 * Modern save button with loading state
 */
export const SaveButton: FC<SaveButtonProps> = ({
  loading = false,
  disabled = false,
  onClick,
  type = "submit",
  children,
  className = "",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`
        relative px-6 py-3 rounded-lg font-semibold text-white
        bg-gradient-to-r from-orange-500 to-orange-600
        hover:from-orange-600 hover:to-orange-700
        focus:outline-none focus:ring-4 focus:ring-orange-200
        disabled:opacity-60 disabled:cursor-not-allowed
        transform transition-all duration-200
        hover:scale-[1.02] active:scale-[0.98]
        shadow-lg hover:shadow-xl
        ${className}
      `}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Processing...</span>
        </span>
      ) : (
        children
      )}
    </button>
  )
}

interface FormSuccessProps {
  message: string
  onClose?: () => void
}

/**
 * Success message overlay
 */
export const FormSuccess: FC<FormSuccessProps> = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 animate-slide-up shadow-2xl">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Message */}
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Success!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>

          {/* Close Button */}
          {onClose && (
            <Button
              onClick={onClose}
              className="bg-green-600 hover:bg-green-700"
            >
              Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

interface FormErrorProps {
  message: string
  onClose?: () => void
}

/**
 * Error message overlay
 */
export const FormError: FC<FormErrorProps> = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 animate-slide-up shadow-2xl">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          {/* Message */}
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Error
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>

          {/* Close Button */}
          {onClose && (
            <Button onClick={onClose} color="failure">
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

interface ProgressStepsProps {
  steps: string[]
  currentStep: number
}

/**
 * Progress steps indicator
 */
export const ProgressSteps: FC<ProgressStepsProps> = ({ steps, currentStep }) => {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                  transition-all duration-300
                  ${
                    index < currentStep
                      ? "bg-green-500 text-white"
                      : index === currentStep
                      ? "bg-orange-500 text-white ring-4 ring-orange-200"
                      : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
                  }
                `}
              >
                {index < currentStep ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`
                  mt-2 text-xs font-medium
                  ${
                    index <= currentStep
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-500 dark:text-gray-400"
                  }
                `}
              >
                {step}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`
                  flex-1 h-1 mx-2
                  transition-all duration-300
                  ${
                    index < currentStep
                      ? "bg-green-500"
                      : "bg-gray-300 dark:bg-gray-600"
                  }
                `}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Form section card with modern design
 */
interface FormSectionProps {
  title: string
  description?: string
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export const FormSection: FC<FormSectionProps> = ({
  title,
  description,
  icon,
  children,
  className = "",
}) => {
  return (
    <div
      className={`
      bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm
      border border-gray-200 dark:border-gray-700
      hover:shadow-md transition-shadow duration-200
      ${className}
    `}
    >
      <div className="flex items-start gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        {icon && (
          <div className="flex-shrink-0 w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center text-orange-600 dark:text-orange-400">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}
