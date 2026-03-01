/* eslint-disable jsx-a11y/anchor-is-valid */
import { Button, Card, Label, TextInput, Select } from "flowbite-react"
import { useEffect, useState, type FC, FormEvent,  SetStateAction } from "react"
import { useNavigate } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import http from "../../common/httpRequest"

interface Role {
  _id: string
  roleName: string
  isRoot: boolean
}

const RegisterPage: FC = function () {
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNo, setPhoneNo] = useState("")
  const [password, setPassword] = useState("")
  const [roleId, setRoleId] = useState("")
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 🔹 Fetch roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await http.get("/role/getAllRole")
        const filteredRoles = res.data.data.filter(
          (role: Role) => role.isRoot === false
        )
        setRoles(filteredRoles)
      } catch (error) {
        toast.error("Failed to load roles")
      }
    }

    fetchRoles()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!roleId) {
      toast.error("Please select a role")
      return
    }

    setIsLoading(true)

    try {
      await http.post("/admin/register", {
        name,
        email,
        phoneNo: Number(phoneNo),
        password,
        roleId
      })

      toast.success("Admin registered successfully")
      setTimeout(() => navigate("/login"), 1000)
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center px-6 lg:h-screen">
      <ToastContainer position="top-center" autoClose={3000} />

      <div className="my-6">
        <img 
          src="/images/truecargo.jpeg" 
          alt="TRUECARGO Logo"
          className="h-24 w-auto object-contain"
        />
      </div>

      <Card className="w-full md:max-w-screen-sm md:[&>*]:p-16">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="name">Name</Label>
            <TextInput
              id="name"
              value={name}
              onChange={(e: { target: { value: SetStateAction<string> } }) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="email">Email</Label>
            <TextInput
              id="email"
              type="email"
              value={email}
              onChange={(e: { target: { value: SetStateAction<string> } }) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="phone">Phone Number</Label>
            <TextInput
              id="phone"
              type="tel"
              value={phoneNo}
              onChange={(e: { target: { value: SetStateAction<string> } }) => setPhoneNo(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="password">Password</Label>
            <TextInput
              id="password"
              type="password"
              value={password}
              onChange={(e: { target: { value: SetStateAction<string> } }) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <Label htmlFor="role">Role</Label>
            <Select
              id="role"
              value={roleId}
              onChange={(e: { target: { value: SetStateAction<string> } }) => setRoleId(e.target.value)}
              required
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role._id} value={role._id}>
                  {role.roleName}
                </option>
              ))}
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#272727] hover:bg-[#272727]_hover"
            disabled={isLoading}
          >
            {isLoading ? "Registering..." : "Register"}
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default RegisterPage
