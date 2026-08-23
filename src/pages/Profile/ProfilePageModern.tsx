import { FC, useEffect, useMemo, useState } from "react"
import { Card, Avatar } from "flowbite-react"
import { HiUser, HiOfficeBuilding, HiPhone, HiLocationMarker } from "react-icons/hi"
import NavbarSidebarLayout from "../../layouts/navbar-sidebar"
import { fetchAgencyDashboard } from "../../common/dashboardApi"

interface ProfileData {
  displayName: string      // Agency Name / Hub Name
  ownerName: string        // Agency Owner / Hub Manager Name
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  email: string
  franchiseCode: string
  inTransitOrders: number
  totalOrders: number
  totalRevenue: number
  deliveredOrders: number
  memberSince: string
}

const ProfilePageModern: FC = () => {
  const sessionLoginType = sessionStorage.getItem("loginType") || ""
  const [agencyStats, setAgencyStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    inTransitOrders: 0,
    deliveredOrders: 0,
  })
  const [statsLoading, setStatsLoading] = useState(false)

  const profileDataRaw = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("profileData") || "{}")
    } catch {
      return {}
    }
  })()

  const isHubLogin =
    sessionLoginType === "hub" ||
    sessionLoginType === "hub_staff" ||
    profileDataRaw?.userType === "hub" ||
    profileDataRaw?.module === "hub"

  const getProfileFromSession = (): ProfileData => {
    const rawData = profileDataRaw

    // Hub sessions keep the real details under `user`; agency sessions keep them
    // at the top level (and duplicated under `data`).
    const baseData = isHubLogin
      ? (rawData?.user || rawData?.data?.user || rawData)
      : (rawData?.data || rawData)

    const displayName = isHubLogin
      ? (baseData?.hubName || rawData?.hubName || "")
      : (baseData?.agencyName || "")

    const ownerName = isHubLogin
      ? (baseData?.hubManagerName || "")
      : (baseData?.agencyOwner || "")

    return {
      displayName,
      ownerName,
      phone: String(baseData?.phone || baseData?.phoneNo || ""),
      address: baseData?.address || "",
      city: baseData?.city || "",
      state: baseData?.state || "",
      pincode: String(baseData?.pincode || ""),
      email: baseData?.email || "",
      franchiseCode: baseData?.agencyCode || baseData?.franchiseCode || baseData?.code || "",
      inTransitOrders: baseData?.inTransitOrders || baseData?.wallet?.balance || 0,
      totalOrders: baseData?.totalOrders || baseData?.orders?.total || 0,
      activeOrders: baseData?.activeOrders || baseData?.orders?.active || 0,
      completedOrders: baseData?.completedOrders || baseData?.orders?.completed || 0,
      memberSince: baseData?.createdAt || rawData?.createdAt || baseData?.memberSince || "N/A"
    }
  }

  const profileData = getProfileFromSession()

  useEffect(() => {
    if (isHubLogin) return

    let cancelled = false

    const loadAgencyStats = async () => {
      setStatsLoading(true)
      try {
        const payload = await fetchAgencyDashboard()
        const overview = payload?.overview || {}

        if (cancelled) return

        setAgencyStats({
          totalOrders: Number(overview.totalOrders || 0),
          totalRevenue: Number(overview.totalRevenue || 0),
          inTransitOrders: Number(overview.inTransitOrders || 0),
          deliveredOrders: Number(overview.deliveredOrders || 0),
        })
      } catch {
        if (!cancelled) {
          setAgencyStats({
            totalOrders: 0,
            totalRevenue: 0,
            inTransitOrders: 0,
            deliveredOrders: 0,
          })
        }
      } finally {
        if (!cancelled) {
          setStatsLoading(false)
        }
      }
    }

    loadAgencyStats()

    return () => {
      cancelled = true
    }
  }, [isHubLogin])

  const agencyStatCards = useMemo(() => ([
    {
      label: "Total Revenue",
      value: `₹${agencyStats.totalRevenue.toLocaleString("en-IN")}`,
      tone: "text-green-600 dark:text-green-400",
    },
    {
      label: "Total Orders",
      value: agencyStats.totalOrders,
      tone: "text-yellow-600 dark:text-yellow-400",
    },
    {
      label: "In Transit Orders",
      value: `${agencyStats.inTransitOrders.toLocaleString("en-IN")}`,
      tone: "text-orange-600 dark:text-orange-400",
    },
    {
      label: "Delivered Orders",
      value: agencyStats.deliveredOrders,
      tone: "text-purple-600 dark:text-purple-400",
    },
  ]), [agencyStats])

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === "N/A") return "N/A"
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    } catch {
      return dateStr
    }
  }

  const DetailRow: FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 rounded-lg bg-gray-100 px-4 py-3 dark:bg-gray-700">
      <div className="mt-0.5 text-orange-500">{icon}</div>
      <div className="min-w-0">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {label}
        </div>
        <div className="mt-0.5 break-words text-sm font-semibold text-gray-900 dark:text-white">
          {value || "N/A"}
        </div>
      </div>
    </div>
  )

  return (
    <NavbarSidebarLayout>
      <div className="px-4">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View your account details
          </p>
        </div>

        {/* Profile Header Card */}
        <Card className="mb-6">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
            <Avatar
              size="lg"
              img={`https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.displayName || "User")}&background=FFCC00&color=fff&size=128`}
              rounded
            />
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-white">
                {profileData.displayName || "User"}
              </h2>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                {profileData.ownerName && `${profileData.ownerName} • `}
                {profileData.franchiseCode || profileData.email}
              </p>
              {isHubLogin && (
                <p className="mt-1 text-sm text-gray-500">
                  Member since {formatDate(profileData.memberSince)}
                </p>
              )}
            </div>
          </div>

          {/* Stats — agency only */}
          {!isHubLogin && (
            <div className="grid grid-cols-2 gap-3 border-t pt-4 md:grid-cols-4">
              {agencyStatCards.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className={`text-2xl font-bold ${stat.tone}`}>
                    {statsLoading ? "..." : stat.value}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Profile Information (read-only) */}
        <Card>
          <div className="flex items-center gap-2">
            <HiOfficeBuilding className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isHubLogin ? "Hub Information" : "Agency Information"}
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DetailRow
              icon={<HiOfficeBuilding className="h-5 w-5" />}
              label={isHubLogin ? "Hub Name" : "Agency Name"}
              value={profileData.displayName}
            />
            <DetailRow
              icon={<HiUser className="h-5 w-5" />}
              label={isHubLogin ? "Hub Manager Name" : "Agency Owner"}
              value={profileData.ownerName}
            />
            <DetailRow
              icon={<HiPhone className="h-5 w-5" />}
              label="Phone Number"
              value={profileData.phone}
            />
            <DetailRow
              icon={<HiLocationMarker className="h-5 w-5" />}
              label="Address"
              value={[profileData.address, profileData.city, profileData.state, profileData.pincode]
                .filter(Boolean)
                .join(", ")}
            />
          </div>
        </Card>
      </div>
    </NavbarSidebarLayout>
  )
}

export default ProfilePageModern
