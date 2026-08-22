import http from "./httpRequest"

export const fetchAgencyDashboard = async () => {
  const response = await http.get("/admin/agency/dashboard")
  return response.data?.data || response.data || {}
}

