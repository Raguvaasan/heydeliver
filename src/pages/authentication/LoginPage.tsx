/* eslint-disable jsx-a11y/anchor-is-valid */
import { Label } from "flowbite-react"
import { useEffect, useRef, useState, type FC, FormEvent } from "react"
import { HiEye, HiEyeOff } from "react-icons/hi"
import { HiArrowPath } from "react-icons/hi2"
import { loginAdminUser, loginHubUser, sendFranchiseLoginOtp, verifyFranchiseLoginOtp, sendStaffLoginOtp, verifyStaffLoginOtp } from "../../store/loginStore"
import toast from "react-hot-toast"
import truckImg from "../../../public/images/Gemini_Generated_Image_fnjmi7fnjmi7fnjm.png"
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
  const [phone, setPhone] = useState("")
  const [countryCode, setCountryCode] = useState("+91")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [mobileOtpStep, setMobileOtpStep] = useState<"phone" | "verify">("phone")
  const [resendTimer, setResendTimer] = useState(17)
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([])
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [staffType, setStaffType] = useState<"franchise" | "hub" | "head_quarter">("head_quarter")
  const [showPassword, setShowPassword] = useState(false)
  const [loginType, setLoginType] = useState<"admin" | "franchise" | "staff" | "hub">("admin")
  const [captchaQuestion, setCaptchaQuestion] = useState<string>("")
  const [captchaAnswer, setCaptchaAnswer] = useState<string>("")
  const [captchaInput, setCaptchaInput] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    const hadDarkClass = root.classList.contains("dark")

    root.classList.remove("dark")

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    let generated = ""
    for (let i = 0; i < 4; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setCaptchaQuestion(generated)
    setCaptchaAnswer(generated)

    return () => {
      if (hadDarkClass) {
        root.classList.add("dark")
      }
    }
  }, [])

  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    let generated = ""
    for (let i = 0; i < 4; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setCaptchaQuestion(generated)
    setCaptchaAnswer(generated)
    setCaptchaInput("")
  }

  const handleSendOtp = async (): Promise<void> => {
    if (!phone.trim()) {
      toast.error("Please enter phone number", { duration: 4000 })
      return
    }

    setIsSendingOtp(true)
    try {
      const response =
        loginType === "staff"
          ? await sendStaffLoginOtp(phone, countryCode, staffType)
          : await sendFranchiseLoginOtp(phone, countryCode)
      const sent = response?.data?.success ?? true
      if (!sent) {
        throw new Error(response?.data?.message || "Unable to send OTP")
      }

      setOtpSent(true)
      setMobileOtpStep("verify")
      setResendTimer(17)
      toast.success(response?.data?.message || "OTP sent successfully")
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to send OTP"
      toast.error(errorMessage, { duration: 5000 })
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault()

    if (loginType !== "staff" && loginType !== "franchise" && captchaInput.toUpperCase() !== captchaAnswer.toUpperCase()) {
      toast.error("Please enter the correct captcha", { duration: 4000 })
      return
    }
    setIsLoading(true)

    try {
      let result: LoginResponse

      if (loginType === "franchise") {
        if (!otpSent) {
          throw new Error("Please send OTP first")
        }
        if (!otp.trim()) {
          throw new Error("Please enter OTP")
        }
        result = (await verifyFranchiseLoginOtp(phone, countryCode, otp)) as LoginResponse
      } else if (loginType === "staff") {
        if (!otpSent) {
          throw new Error("Please send OTP first")
        }
        if (!otp.trim()) {
          throw new Error("Please enter OTP")
        }
        result = (await verifyStaffLoginOtp(phone, countryCode, otp, staffType)) as LoginResponse
      } else if (loginType === "hub") {
        result = (await loginHubUser(username, password)) as LoginResponse
      } else {
        result = (await loginAdminUser(email, password)) as LoginResponse
      }
      const isSuccess =
        typeof result.data?.success === "boolean"
          ? result.data.success
          : true

      if (isSuccess) {
        const token = result.data?.token || result.data?.["data"]?.token
        const rawUserData = result.data?.["data"] || result.data
        const userData = result.data?.["data"]
          ? { ...rawUserData, data: result.data["data"] }
          : rawUserData
        const resolvedType = String(
          userData?.type ||
          userData?.data?.type ||
          ""
        ).toLowerCase()
        const effectiveLoginType =
          loginType === "staff" && (resolvedType === "hub" || resolvedType === "franchise" || resolvedType === "head_quarter")
            ? resolvedType === "head_quarter"
              ? "admin"
              : resolvedType
            : loginType

        if (token) {
          sessionStorage.setItem("authToken", token)
        } else {
          const sessionId = `session_${loginType}_${Date.now()}`
          sessionStorage.setItem("authToken", sessionId)
        }

        sessionStorage.setItem("profileData", JSON.stringify(userData))
        sessionStorage.setItem("loginType", effectiveLoginType)

        toast.success("Login successful! Redirecting...")
        setTimeout(() => {
          window.location.href = "/admin/dashboard"
        }, 1500)
      } else {
        throw new Error(result.data?.message || "Invalid response from server")
      }
    } catch (err: any) {
      let errorMessage = err.response?.data?.message || err.message || "Invalid login credentials"
      if (err.response?.status === 404) {
        errorMessage = "Incorrect email/username or password"
      }

      toast.error(errorMessage, { duration: 5000 })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (loginType !== "franchise" && loginType !== "staff") {
      setPhone("")
      setCountryCode("+91")
      setOtp("")
      setOtpSent(false)
      setMobileOtpStep("phone")
    }
  }, [loginType])

  useEffect(() => {
    if ((loginType !== "staff" && loginType !== "franchise") || mobileOtpStep !== "verify" || resendTimer <= 0) return
    const id = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(id)
  }, [loginType, mobileOtpStep, resendTimer])

  const formatResendTimer = (seconds: number): string => {
    const s = Math.max(0, seconds)
    return `00:${String(s).padStart(2, "0")}`
  }

  const handleOtpDigitChange = (index: number, rawValue: string) => {
    const digit = rawValue.replace(/\D/g, "").slice(-1)
    const next = otp.padEnd(6, " ").split("")
    next[index] = digit || " "
    const joined = next.join("").replace(/\s/g, "")
    setOtp(joined)
    if (digit && index < 5) otpInputRefs.current[index + 1]?.focus()
  }

  const handleOtpBackspace = (index: number, key: string) => {
    if (key !== "Backspace") return
    const padded = otp.padEnd(6, " ").split("")
    if (padded[index]?.trim()) {
      padded[index] = " "
      setOtp(padded.join("").replace(/\s/g, ""))
      return
    }
    if (index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  useEffect(() => {
    if (loginType !== "staff") {
      setStaffType("head_quarter")
    }
  }, [loginType])

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-white via-[#fffef8] to-[#fffdf3]">

      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary-100 to-primary-50 rounded-full opacity-45 mix-blend-multiply filter animate-blob"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full opacity-45 mix-blend-multiply filter animate-blob animation-delay-4000"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-primary-50 to-primary-100 rounded-full opacity-40 mix-blend-multiply filter animate-blob animation-delay-2000"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-primary-50 to-primary-100 rounded-full opacity-35 mix-blend-multiply filter animate-blob animation-delay-3000"></div>
      </div>

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 204, 0, 0.04) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/75 via-white/25 to-transparent pointer-events-none"></div>

      {/* Layout */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-20 py-8 lg:py-0">
        <div className="w-full max-w-6xl flex items-center justify-between gap-12">

          {/* Left Side — Branding (desktop only) */}
          <div className="hidden lg:flex flex-col justify-center w-1/2 pr-8">
            <div className="space-y-6 mb-16">
              <div className="inline-block rounded-2xl bg-white/90 px-6 py-4">
                <img
                  src="https://truecargos.com/admin/images/logo.png"
                  alt="TRUECARGO Logo"
                  className="w-auto object-contain"
                />
              </div>

              <div className="flex justify-center flex-wrap gap-3 mt-8">
                <span className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 border border-primary-200">
                  ⚡ Real-time Tracking
                </span>
                <span className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 border border-primary-200">
                  🔒 Secure Platform
                </span>
                <span className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 border border-primary-200">
                  📊 Advanced Analytics
                </span>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-6 rounded-[2.5rem] blur-3xl opacity-25 group-hover:opacity-35 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,rgba(255,204,0,0.42)_0%,rgba(255,204,0,0.18)_45%,rgba(255,204,0,0)_75%)]"></div>
              <div className="relative bg-gradient-to-br from-blue-50/90 via-white/90 to-blue-100/90 backdrop-blur-xl rounded-[2rem] overflow-hidden border border-primary-200 shadow-[0_18px_42px_rgba(255,204,0,0.24)] hover:shadow-[0_22px_52px_rgba(255,204,0,0.32)] transform transition-transform duration-300 group-hover:scale-[1.02]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-400/20 to-transparent rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary-300/20 to-transparent rounded-full blur-2xl"></div>
                <div className="relative z-10 w-full aspect-[16/9] overflow-hidden rounded-2xl">
                  <img
                    src={truckImg}
                    alt="Delivery Truck"
                    className="h-full w-full object-cover object-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side — Login Card */}
          <div className="w-full lg:w-1/2 max-w-lg mx-auto lg:mx-0 lg:ml-auto">

            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <img
                src="https://truecargos.com/admin/images/logo.png"
                alt="TRUECARGO Logo"
                className="h-16 sm:h-20 w-auto mx-auto object-contain"
              />
            </div>

            <div className="relative group">
              {/* Card Glow */}
              <div className="absolute -inset-1 rounded-[2rem] blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,rgba(255,204,0,0.40)_0%,rgba(255,204,0,0.16)_48%,rgba(255,204,0,0)_78%)]"></div>

              {/* Main Card */}
              <div className="relative bg-white/95 backdrop-blur-2xl rounded-2xl sm:rounded-[1.75rem] p-6 sm:p-8 lg:p-12 border border-primary-200 shadow-[0_20px_48px_rgba(255,204,0,0.20)] hover:shadow-[0_24px_56px_rgba(255,204,0,0.28)] transition-shadow duration-300">

                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 text-center">
                  {((loginType === "staff" || loginType === "franchise") && mobileOtpStep === "verify") ? "Verify OTP" : "Sign In"}
                </h2>
                <p className="text-gray-600 text-center mb-5 text-sm">
                  {(loginType === "staff" || loginType === "franchise")
                    ? (mobileOtpStep === "verify" ? `A one time password was sent to ${countryCode}${phone}` : "Enter mobile number to receive OTP")
                    : "Enter your credentials to access your account"}
                </p>

                {/* Login Type Selector */}
                {!((loginType === "staff" || loginType === "franchise") && mobileOtpStep === "verify") && (
                  <div className="flex mb-6 justify-center gap-2 sm:gap-4 flex-wrap">
                    {(["admin", "franchise", "hub", "staff"] as const).map((type) => (
                      <label key={type} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="loginType"
                          value={type}
                          checked={loginType === type}
                          onChange={() => setLoginType(type)}
                          className="sr-only peer"
                        />
                        <div
                          className={`px-3 sm:px-5 py-2.5 rounded-xl border-2 transition-all duration-200 cursor-pointer select-none ${loginType === type
                              ? "border-primary-400 bg-primary-50"
                              : "border-gray-200 hover:border-primary-300"
                            }`}
                          onClick={() => setLoginType(type)}
                        >
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${loginType === type ? "border-primary-400" : "border-gray-300"
                                }`}
                            >
                              {loginType === type && (
                                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                              )}
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-gray-700 capitalize whitespace-nowrap">
                              {type}
                            </span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Staff OTP Layout */}
                  {loginType === "staff" ? (
                    <>
                      {mobileOtpStep === "verify" && (
                        <button
                          type="button"
                          onClick={() => setMobileOtpStep("phone")}
                          className="text-sm text-gray-600 hover:text-gray-900 mb-1"
                        >
                          ← Back
                        </button>
                      )}
                      {mobileOtpStep === "phone" && (
                        <>
                          <div className="space-y-1">
                            <Label htmlFor="staffPhone" className="block text-sm font-semibold text-gray-700">
                              Phone Number
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-[96px_1fr] gap-2">
                              <input
                                id="countryCode"
                                type="text"
                                value={countryCode}
                                onChange={(e) => setCountryCode(e.target.value)}
                                required
                                className="w-full text-base px-3 py-3 rounded-xl border border-gray-300 text-gray-700 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all duration-200 bg-white"
                              />
                              <input
                                id="staffPhone"
                                type="tel"
                                placeholder="Enter phone number"
                                value={phone}
                                onChange={(e) => {
                                  const nextPhone = e.target.value.replace(/\D/g, "")
                                  setPhone(nextPhone)
                                  setOtpSent(false)
                                  if (mobileOtpStep === "verify") setMobileOtpStep("phone")
                                }}
                                required
                                className="w-full text-base px-4 py-3 rounded-xl border border-gray-300 text-gray-700 placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all duration-200 bg-white"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label htmlFor="staffType" className="block text-sm font-semibold text-gray-700">
                              Type
                            </Label>
                            <select
                              id="staffType"
                              value={staffType}
                              onChange={(e) => {
                                setStaffType(e.target.value as "franchise" | "hub" | "head_quarter")
                                setOtpSent(false)
                              }}
                              className="w-full text-base pl-4 pr-10 py-3 rounded-xl border border-gray-300 text-gray-700 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all duration-200 bg-white"
                            >
                              <option value="franchise">Franchise</option>
                              <option value="hub">Hub</option>
                              <option value="head_quarter">Head Quarter</option>
                            </select>
                          </div>
                        </>
                      )}

                      {mobileOtpStep === "phone" ? (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={isSendingOtp || !phone.trim()}
                          className="w-full py-3 rounded-xl border border-primary-300 text-sm font-semibold hover:bg-primary-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        >
                          {isSendingOtp ? "Sending..." : "Continue"}
                        </button>
                      ) : (
                        <>
                          <div className="space-y-1">
                            <div className="flex gap-4 mt-2">
                              {[0, 1, 2, 3, 4, 5].map((i) => (
                                <input
                                  key={i}
                                  ref={(el) => { otpInputRefs.current[i] = el }}
                                  type="text"
                                  inputMode="numeric"
                                  maxLength={1}
                                  value={otp[i] || ""}
                                  onChange={(e) => handleOtpDigitChange(i, e.target.value)}
                                  onKeyDown={(e) => handleOtpBackspace(i, e.key)}
                                  className="h-12 w-12 rounded-md border border-gray-300 text-center text-lg font-semibold text-gray-800 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:outline-none"
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            Didn&apos;t receive OTP?{" "}
                            {resendTimer > 0 ? (
                              <span>Resend in <span className="font-semibold">{formatResendTimer(resendTimer)}</span> Sec</span>
                            ) : (
                              <button type="button" onClick={handleSendOtp} disabled={isSendingOtp} className="font-semibold text-gray-800 hover:text-black">
                                {isSendingOtp ? "Sending..." : "Resend"}
                              </button>
                            )}
                          </p>
                        </>
                      )}
                    </>
                  ) : loginType === "franchise" ? (
                    <>
                      {mobileOtpStep === "verify" && (
                        <button
                          type="button"
                          onClick={() => setMobileOtpStep("phone")}
                          className="text-sm text-gray-600 hover:text-gray-900 mb-1"
                        >
                          ← Back
                        </button>
                      )}
                      {/* Franchise OTP Layout */}
                      {mobileOtpStep === "phone" && (
                        <div className="space-y-1">
                          <Label htmlFor="franchisePhone" className="block text-sm font-semibold text-gray-700">
                            Phone Number
                          </Label>
                          <div className="grid grid-cols-1 sm:grid-cols-[96px_1fr] gap-2">
                            <input
                              id="countryCode"
                              type="text"
                              value={countryCode}
                              onChange={(e) => setCountryCode(e.target.value)}
                              required
                              className="w-full text-base px-3 py-3 rounded-xl border border-gray-300 text-gray-700 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all duration-200 bg-white"
                            />
                            <input
                              id="franchisePhone"
                              type="tel"
                              placeholder="Enter phone number"
                              value={phone}
                              onChange={(e) => {
                                const nextPhone = e.target.value.replace(/\D/g, "")
                                setPhone(nextPhone)
                                setOtpSent(false)
                                if (mobileOtpStep === "verify") setMobileOtpStep("phone")
                              }}
                              required
                              className="w-full text-base px-4 py-3 rounded-xl border border-gray-300 text-gray-700 placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all duration-200 bg-white"
                            />
                          </div>
                        </div>
                      )}

                      {mobileOtpStep === "phone" ? (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={isSendingOtp || !phone.trim()}
                          className="w-full py-3 rounded-xl border border-primary-300 text-sm font-semibold hover:bg-primary-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        >
                          {isSendingOtp ? "Sending..." : "Continue"}
                        </button>
                      ) : (
                        <>
                          <div className="space-y-1">
                            <div className="flex gap-4 mt-2">
                              {[0, 1, 2, 3, 4, 5].map((i) => (
                                <input
                                  key={i}
                                  ref={(el) => { otpInputRefs.current[i] = el }}
                                  type="text"
                                  inputMode="numeric"
                                  maxLength={1}
                                  value={otp[i] || ""}
                                  onChange={(e) => handleOtpDigitChange(i, e.target.value)}
                                  onKeyDown={(e) => handleOtpBackspace(i, e.key)}
                                  className="h-12 w-12 rounded-md border border-gray-300 text-center text-lg font-semibold text-gray-800 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:outline-none"
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            Didn&apos;t receive OTP?{" "}
                            {resendTimer > 0 ? (
                              <span>Resend in <span className="font-semibold">{formatResendTimer(resendTimer)}</span> Sec</span>
                            ) : (
                              <button type="button" onClick={handleSendOtp} disabled={isSendingOtp} className="font-semibold text-gray-800 hover:text-black">
                                {isSendingOtp ? "Sending..." : "Resend"}
                              </button>
                            )}
                          </p>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Email / Username */}
                      <div className="space-y-1">
                        <Label
                          htmlFor={loginType === "admin" ? "email" : "username"}
                          className="block text-sm font-semibold text-gray-700"
                        >
                          {loginType === "admin" ? "Email Address" : "Username"}
                        </Label>
                        <input
                          id={loginType === "admin" ? "email" : "username"}
                          type={loginType === "admin" ? "email" : "text"}
                          placeholder={loginType === "admin" ? "you@example.com" : "Enter your username"}
                          value={loginType === "admin" ? email : username}
                          onChange={(e) =>
                            loginType === "admin" ? setEmail(e.target.value) : setUsername(e.target.value)
                          }
                          required
                          className="w-full text-base pl-4 pr-4 py-3 rounded-xl border border-gray-300 text-gray-700 placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all duration-200 bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                          Password
                        </Label>
                        <div className="relative">
                          <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                            className="w-full text-base pl-4 pr-12 py-3 rounded-xl border border-gray-300 text-gray-700 placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all duration-200 bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors p-1"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? (
                              <HiEye className="h-5 w-5" />
                            ) : (
                              <HiEyeOff className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Captcha */}
                  {loginType !== "staff" && loginType !== "franchise" && (
                    <div className="space-y-1">
                      <Label className="block text-sm font-semibold text-gray-700">Captcha</Label>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="px-4 py-3 rounded-xl border-2 border-gray-300 bg-white text-gray-900 font-semibold tracking-widest text-base min-w-[80px] text-center select-none">
                          {captchaQuestion || "----"}
                        </div>
                        <button
                          type="button"
                          onClick={generateCaptcha}
                          className="px-3 py-2.5 text-sm font-semibold border border-primary-300 rounded-lg transition-colors flex items-center gap-1.5 hover:bg-primary-50 whitespace-nowrap flex-shrink-0"
                        >
                          <HiArrowPath className="h-4 w-4" />
                          <span className="hidden sm:inline">Refresh</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Enter the letters above"
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                        required
                        className="w-full text-base pl-4 pr-4 py-3 rounded-xl border border-gray-300 text-gray-700 placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all duration-200 bg-white"
                      />
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || ((loginType === "staff" || loginType === "franchise") && mobileOtpStep !== "verify")}
                    className="w-full h-13 sm:h-14 mt-6 sm:mt-8 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-bold text-base sm:text-lg rounded-xl shadow-[0_10px_24px_rgba(255,204,0,0.28)] hover:shadow-[0_14px_32px_rgba(255,204,0,0.38)] transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    style={{ minHeight: "52px" }}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <span>{(loginType === "staff" || loginType === "franchise") ? "Login" : "Sign In"}</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
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
    </div>
  )
}

export default LoginPage
