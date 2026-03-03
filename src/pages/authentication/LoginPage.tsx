/* eslint-disable jsx-a11y/anchor-is-valid */
import { Label } from "flowbite-react"
import { useEffect, useState, type FC, FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { HiEye, HiEyeOff } from "react-icons/hi"
import { HiArrowPath } from "react-icons/hi2"
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
  const [captchaQuestion, setCaptchaQuestion] = useState<string>("")
  const [captchaAnswer, setCaptchaAnswer] = useState<string>("")
  const [captchaInput, setCaptchaInput] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const root = document.documentElement
    const hadDarkClass = root.classList.contains("dark")

    // Keep login screen in light mode for readability.
    root.classList.remove("dark")

    return () => {
      if (hadDarkClass) {
        root.classList.add("dark")
      }
    }
  }, [])

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault()

    // Captcha validation
    if (captchaInput.toUpperCase() !== captchaAnswer.toUpperCase()) {
      toast.error("Please enter the correct captcha", { duration: 4000 })
      return
    }
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
          lastError = adminError
          try {
            result = (await loginStaffUser(email, password)) as LoginResponse
          } catch (staffError: any) {
            // Both failed, throw the most recent error
            throw staffError
          }
        }
      }

      // Check for success in response
      const isSuccess = result.data?.success
      
      if (isSuccess) {
        // Check both possible response structures for token
        const token = result.data?.token || result.data?.["data"]?.token
        const userData = result.data?.["data"] || result.data

        if (token) {
          // Store authentication token securely
          // TODO: Consider moving to HttpOnly cookies for better security
          sessionStorage.setItem("authToken", token)
        } else {
          // If no token, create a session identifier for franchise/staff login
          const sessionId = `session_${loginType}_${Date.now()}`
          sessionStorage.setItem("authToken", sessionId)
        }
        
        sessionStorage.setItem(
          "profileData",
          JSON.stringify(userData)
        )
        sessionStorage.setItem("loginType", loginType)

        toast.success("Login successful! Redirecting...")
        setTimeout(() => {
          window.location.href = "/admin/dashboard"
        }, 1500)
      } else {
        throw new Error(result.data?.message || "Invalid response from server")
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Invalid login credentials"
      
      toast.error(errorMessage, {
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-white via-[#fffef8] to-[#fffdf3]">
      
      {/* Premium Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Right Side Blobs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary-100 to-primary-50 rounded-full opacity-45 mix-blend-multiply filter animate-blob"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full opacity-45 mix-blend-multiply filter animate-blob animation-delay-4000"></div>
        
        {/* Left Side Blobs */}
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-primary-50 to-primary-100 rounded-full opacity-40 mix-blend-multiply filter animate-blob animation-delay-2000"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-primary-50 to-primary-100 rounded-full opacity-35 mix-blend-multiply filter animate-blob animation-delay-3000"></div>
      </div>

      {/* Elegant Grid Pattern */}
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 204, 0, 0.04) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}></div>

      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/75 via-white/25 to-transparent"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-between px-8 lg:px-20 max-w-7xl mx-auto">
        {/* Left Side - Branding & Illustration */}
        <div className="hidden lg:flex flex-col justify-center w-1/2 pr-16">
          <div className="space-y-6 mb-16">
            {/* Logo Image */}
            <div className="inline-block rounded-2xl bg-white/90 px-6 py-4">
              <img 
                src="/images/truecargo.png" 
                alt="TRUECARGO Logo"
                className="w-auto object-contain"
              />
            </div>
            
            {/* Feature Pills */}
            <div className="flex justify-center flex-wrap gap-3 mt-8">
              <span className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 border border-orange-100">
                ⚡ Real-time Tracking
              </span>
              <span className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 border border-orange-100">
                🔒 Secure Platform
              </span>
              <span className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 border border-orange-100">
                📊 Advanced Analytics
              </span>
            </div>
          </div>
          
          {/* Delivery Truck Illustration with Premium Effects */}
          <div className="relative group">
            <div className="absolute -inset-6 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 rounded-[2.5rem] blur-3xl opacity-25 group-hover:opacity-35 transition-opacity duration-500"></div>
            <div className="relative bg-gradient-to-br from-blue-50/90 via-white/90 to-blue-100/90 backdrop-blur-xl rounded-[2rem] p-10 overflow-hidden border border-orange-100/30 transform transition-transform duration-300 group-hover:scale-[1.02]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-transparent rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-amber-400/20 to-transparent rounded-full blur-2xl"></div>
              <img 
                src="/images/Gemini_Generated_Image_fnjmi7fnjmi7fnjm.png" 
                alt="Delivery Truck"
                className="w-full h-auto relative z-10"
              />
            </div>
          </div>
        </div>

        {/* Right Side - Premium Login Card */}
        <div className="w-full lg:w-1/2 max-w-lg lg:ml-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <img 
              src="/images/truecargo.png" 
              alt="TRUECARGO Logo"
              className="h-24 w-auto mx-auto object-contain mb-2"
            />
            {/* <p className="text-sm text-gray-600 mt-2">Move | Connect | Deliver</p> */}
          </div>

          <div className="relative group">
            {/* Card Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 rounded-[2rem] blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
            
            {/* Main Card */}
            <div className="relative bg-white/95 backdrop-blur-2xl rounded-[1.75rem] p-12 border border-orange-200/50">
              
              <h2 className="text-3xl font-bold text-gray-900 mb-1 text-center">
                Sign In
              </h2>
              <p className="text-gray-600 text-center mb-5 text-sm">Enter your credentials to access your account</p>

              {/* Premium Login Type Selector */}
              <div className="flex mb-6 justify-center gap-4">
                <label className="flex items-center cursor-pointer group relative">
                  <input
                    type="radio"
                    name="loginType"
                    value="admin"
                    checked={loginType === "admin"}
                    onChange={() => setLoginType("admin")}
                    className="sr-only peer"
                  />
                  <div className="px-6 py-3 rounded-xl border-2 border-gray-200 peer-checked:border-orange-500 transition-all duration-300 hover:border-orange-300">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:border-orange-500 flex items-center justify-center">
                        {loginType === "admin" && (
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-gray-700 peer-checked:text-orange-600">
                        Admin
                      </span>
                    </div>
                  </div>
                </label>

                <label className="flex items-center cursor-pointer group relative">
                  <input
                    type="radio"
                    name="loginType"
                    value="franchise"
                    checked={loginType === "franchise"}
                    onChange={() => setLoginType("franchise")}
                    className="sr-only peer"
                  />
                  <div className="px-6 py-3 rounded-xl border-2 border-gray-200 peer-checked:border-orange-500 transition-all duration-300 hover:border-orange-300">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:border-orange-500 flex items-center justify-center">
                        {loginType === "franchise" && (
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-gray-700 peer-checked:text-orange-600">
                        Franchise
                      </span>
                    </div>
                  </div>
                </label>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email/Username Field with Premium Styling */}
                <div className="space-y-1">
                  <Label
                    htmlFor={loginType === "admin" ? "email" : "email"}
                    className="block text-sm font-semibold text-gray-700"
                  >
                    {loginType === "admin" ? "Email Address" : "Email Address"}
                  </Label>
                  <div className="relative">
                    <input
                      id={loginType === "admin" ? "email" : "email"}
                      type={loginType === "admin" ? "email" : "email"}
                      placeholder={loginType === "admin" ? "you@example.com" : "Enter your email"}
                      value={loginType === "admin" ? email : username}
                      onChange={(e) => loginType === "admin" ? setEmail(e.target.value) : setUsername(e.target.value)}
                      required
                      className="w-full text-base pl-4 pr-4 py-3 rounded-xl border border-gray-300 text-gray-700 placeholder:text-gray-500 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all duration-200 bg-white"
                    />
                  </div>
                </div>

                {/* Password Field with Premium Styling */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <Label
                      htmlFor="password"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Password
                    </Label>
                    {/* <a href="#" className="text-xs font-medium text-orange-500 hover:text-orange-600 transition-colors">
                      Forgot?
                    </a> */}
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                      className="w-full text-base pl-4 pr-12 py-3 rounded-xl border border-gray-300 text-gray-700 placeholder:text-gray-500 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all duration-200 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
                      aria-label={!showPassword ? "Hide password" : "Show password"}
                    >
                      {!showPassword ? (
                        <HiEyeOff className="h-5 w-5" />
                      ) : (
                        <HiEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Premium Login Button with Gradient */}
                {/* Captcha */}
                <div className="space-y-1">
                  <Label className="block text-sm font-semibold text-gray-700">
                    Captcha
                  </Label>
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-3 rounded-xl border-2 border-gray-300 bg-white text-gray-900 font-semibold">
                      {captchaQuestion || "--"}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
                        let generated = ""
                        for (let i = 0; i < 4; i++) {
                          generated += chars.charAt(Math.floor(Math.random() * chars.length))
                        }
                        setCaptchaQuestion(generated)
                        setCaptchaAnswer(generated)
                        setCaptchaInput("")
                      }}
                      className="px-3 py-2 text-sm font-semibold text-orange-600 border border-orange-200 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <HiArrowPath className="h-4 w-4" />
                      Refresh
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter the letters above"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                    required
                    className="w-full text-base pl-4 pr-4 py-3 rounded-xl border border-gray-300 text-gray-700 placeholder:text-gray-500 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all duration-200 bg-white"
                  />
                </div>

                {/* Premium Login Button with Gradient */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 mt-8 bg-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:via-orange-700 hover:to-amber-600 disabled:from-orange-300 disabled:to-amber-300 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  )
}

export default LoginPage
