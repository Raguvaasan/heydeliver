import { FC } from "react"
import { Link } from "react-router-dom"
import { HiLockClosed } from "react-icons/hi"

const AccessDeniedPage: FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center p-8 max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <HiLockClosed className="w-10 h-10 text-red-500" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Access Denied
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You do not have permission to access this page. Please contact your
          administrator if you believe this is an error.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 focus:ring-4 focus:ring-orange-300 dark:focus:ring-orange-800 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default AccessDeniedPage
