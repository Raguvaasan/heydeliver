/* eslint-disable jsx-a11y/anchor-is-valid */
import { Button, Card, Label, TextInput } from "flowbite-react"
import { useState, type FC, FormEvent, SetStateAction } from "react"
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
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = (await loginAdminUser(email, password)) as LoginResponse

      console.log("Login response:", result) // Debug log

      // Check both possible response structures
      const token = result.data?.token || result.data?.data?.token
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
    <div className="flex flex-col items-center justify-center px-6 lg:h-screen lg:gap-y-12">
      <ToastContainer position="top-center" autoClose={3000} />

      <div className="my-6 flex items-center gap-x-1 lg:my-0">
        <span className="font-bruno text-[23px] font-normal text-trans_main text-2xl">
          heyDeliver ADMIN
        </span>
      </div>

      <Card className="w-full md:max-w-screen-sm md:[&>*]:p-16">
        <form onSubmit={handleSubmit}>
          <div className="mb-4 flex flex-col gap-y-3">
            <Label htmlFor="email">Your email</Label>
            <TextInput
              id="email"
              type="email"
              value={email}
              onChange={(e: { target: { value: SetStateAction<string> } }) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6 flex flex-col gap-y-3">
            <Label htmlFor="password">Your password</Label>
            <TextInput
              id="password"
              type="password"
              value={password}
              onChange={(e: { target: { value: SetStateAction<string> } }) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#272727] hover:bg-[#272727]_hover"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default LoginPage
