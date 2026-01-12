/* eslint-disable jsx-a11y/anchor-is-valid */
import { Button, Label, TextInput } from "flowbite-react"
import { useState, type FC, FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { HiEye, HiEyeOff } from "react-icons/hi"
import { loginAdminUser, loginFranchiseUser, loginStaffUser } from "../../store/loginStore"
import toast from "react-hot-toast"

interface LoginResponse {
  data?: {
    success?: boolean
    message?: string
    token?: string
    [key: string]: any
  }
}

const LoginPage: FC = function () {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loginType, setLoginType] = useState<"admin" | "franchise" | "staff">("admin")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let result: LoginResponse
      let lastError: any = null
      
      if (loginType === "franchise") {
        result = (await loginFranchiseUser(username, password)) as LoginResponse
      } else {
        // Admin login - try admin endpoint first, if it fails try staff endpoint
        try {
          result = (await loginAdminUser(email, password)) as LoginResponse
        } catch (adminError: any) {
          // If admin login fails, try staff login with email as username
          console.log("Admin login failed, trying staff login...")
          console.log("Admin error:", adminError.response?.data)
          lastError = adminError
          try {
            result = (await loginStaffUser(email, password)) as LoginResponse
          } catch (staffError: any) {
            console.log("Staff login also failed:", staffError.response?.data)
            // Both failed, throw the most recent error
            throw staffError
          }
        }
      }

      console.log("Login response:", result) // Debug log

      // Check for success in response
      const isSuccess = result.data?.success
      
      if (isSuccess) {
        // Check both possible response structures for token
        const token = result.data?.token || result.data?.["data"]?.token
        const userData = result.data?.data || result.data

        if (token) {
          console.log("Saving token:", token)
          sessionStorage.setItem("authToken", token)
        } else {
          // If no token, create a session identifier for franchise/staff login
          console.log("No token found, creating session identifier")
          const sessionId = `session_${loginType}_${Date.now()}`
          sessionStorage.setItem("authToken", sessionId)
        }
        
        sessionStorage.setItem(
          "profileData",
          JSON.stringify(userData)
        )
        sessionStorage.setItem("loginType", loginType)

        // Verify data is saved
        console.log("Login data saved successfully")

        toast.success("Login successful! Redirecting...")
        setTimeout(() => {
          window.location.href = "/admin/dashboard"
        }, 1500)
      } else {
        throw new Error(result.data?.message || "Invalid response from server")
      }
    } catch (err: any) {
      console.error("Login error details:", err)
      console.error("Error response:", err.response)
      const errorMessage = err.response?.data?.message || err.message || "Invalid login credentials"
      console.error("Showing error:", errorMessage)
      
      // Show alert as backup in case toast doesn't show
      alert(`Login Failed: ${errorMessage}`)
      
      toast.error(errorMessage, {
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      
      {/* Full Background Image */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/images/loginbg.jpeg)',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <div className="relative z-10 min-h-screen flex items-center justify-end px-12 lg:px-20">
        {/* Logo at Top Center */}
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2">
          <h1 className="text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="text-orange-500">Hey</span>
            <span className="text-gray-900">Deliver</span>
          </h1>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-3xl mr-4 lg:mr-8">
          <div className="bg-white rounded-6xl shadow-xl p-10 border border-gray-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Login
              </h2>

              {/* Login Type Radio Buttons */}
              <div className="flex mb-8 justify-center gap-8">
                <label className="flex items-center cursor-pointer group">
                  <div className="relative">
                    <input
                      type="radio"
                      name="loginType"
                      value="admin"
                      checked={loginType === "admin"}
                      onChange={() => setLoginType("admin")}
                      className="sr-only peer"
                    />
                    <div className="w-6 h-6 border-2 border-gray-300 rounded-full peer-checked:border-orange-500 transition-all flex items-center justify-center">
                      {loginType === "admin" && (
                        <div className="w-3.5 h-3.5 bg-orange-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <span className="ml-2.5 text-base font-medium text-gray-900">
                    Admin Login
                  </span>
                </label>

                <label className="flex items-center cursor-pointer group">
                  <div className="relative">
                    <input
                      type="radio"
                      name="loginType"
                      value="franchise"
                      checked={loginType === "franchise"}
                      onChange={() => setLoginType("franchise")}
                      className="sr-only peer"
                    />
                    <div className="w-6 h-6 border-2 border-gray-300 rounded-full peer-checked:border-orange-500 transition-all flex items-center justify-center">
                      {loginType === "franchise" && (
                        <div className="w-3.5 h-3.5 bg-orange-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <span className="ml-2.5 text-base font-medium text-gray-900">
                    Franchise Login
                  </span>
                </label>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email/Username Field */}
                <div>
                  <Label
                    htmlFor={loginType === "admin" ? "email" : "username"}
                    className="block mb-2.5 text-base font-medium text-gray-700"
                  >
                    {loginType === "admin" ? "Your Email Address*" : "Username*"}
                  </Label>
                  <TextInput
                    id={loginType === "admin" ? "email" : "username"}
                    type={loginType === "admin" ? "email" : "text"}
                    placeholder={loginType === "admin" ? "robertallen@example.com" : "Enter username"}
                    value={loginType === "admin" ? email : username}
                    onChange={(e) => loginType === "admin" ? setEmail(e.target.value) : setUsername(e.target.value)}
                    required
                    className="w-full text-base"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <Label
                    htmlFor="password"
                    className="block mb-2.5 text-base font-medium text-gray-700"
                  >
                    Your Password*
                  </Label>
                  <div className="relative">
                    <TextInput
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                      className="w-full text-base pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <HiEyeOff className="h-5 w-5" />
                      ) : (
                        <HiEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 text-lg font-semibold rounded-lg mt-8"
                  style={{
                    backgroundColor: isLoading ? "#fb923c" : "#f97316",
                    color: 'white',
                  }}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
          </div>
        </div>
        {/* Login Form - Centered */}
       
      </div>
      
    </div>
  )
}

export default LoginPage
