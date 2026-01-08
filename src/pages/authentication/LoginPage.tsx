/* eslint-disable jsx-a11y/anchor-is-valid */
import { Button, Label, TextInput } from "flowbite-react"
import { useState, type FC, FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { loginAdminUser } from "../../store/loginStore"
import { ToastContainer, toast } from "react-toastify"

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
  const [password, setPassword] = useState("")
  const [loginType, setLoginType] = useState<"admin" | "franchise">("admin")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = (await loginAdminUser(email, password)) as LoginResponse

      console.log("Login response:", result) // Debug log

      // Check both possible response structures
      const token = result.data?.token || result.data?.["data"]?.token
      const userData = result.data

      if (token) {
        console.log("Saving token:", token)
        sessionStorage.setItem("authToken", token)
        sessionStorage.setItem(
          "profileData",
          JSON.stringify(userData)
        )

        // Verify token is saved
        const savedToken = sessionStorage.getItem("authToken")
        console.log("Token saved successfully:", savedToken ? "Yes" : "No")

        toast.success("Login successful! Redirecting...")
        setTimeout(() => {
          window.location.href = "/admin/dashboard"
        }, 500)
      } else {
        throw new Error("Invalid response from server")
      }
    } catch (err: any) {
      console.error("Login error:", err)
      toast.error(err.response?.data?.message || "Invalid login credentials")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ToastContainer position="top-center" autoClose={3000} />
      
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

                <label className="flex items-center cursor-pointer group opacity-60">
                  <div className="relative">
                    <input
                      type="radio"
                      name="loginType"
                      value="franchise"
                      checked={loginType === "franchise"}
                      onChange={() => setLoginType("franchise")}
                      disabled
                      className="sr-only peer"
                    />
                    <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                  </div>
                  <span className="ml-2.5 text-base font-medium text-gray-400">
                    Franchise Login
                  </span>
                </label>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <Label
                    htmlFor="email"
                    className="block mb-2.5 text-base font-medium text-gray-700"
                  >
                    Your Email Address*
                  </Label>
                  <TextInput
                    id="email"
                    type="email"
                    placeholder="robertallen@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  <TextInput
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="w-full text-base"
                  />
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
