const adminRoleModules = [
  "Dashboard",
  "Franchise",
  "Collection Agency",
  "Hub",
  "Route",
  "Customers",
  "Access Management",
  "Orders",
  "Payments",
  "Reports",
  "Tracking",
  "Settings",
  "Careers",
]

const franchiseRoleModules = [
  "Dashboard",
  "Orders",
  "Manage Staffs",
  "Role & Permissions",
  "Rate Calculator",
  "Service Availability Check",
  "Tracking",
  "Wallet",
  "Reports",
  "Profile",
]

const hubRestrictedModules = new Set(["Wallet", "Reports"])

interface GetRoleModulesArgs {
  loginType: string
  apiModules?: string[]
  extraModules?: string[]
}

const normalizeModuleName = (moduleName: string): string => moduleName.trim().toLowerCase()

const mergeModules = (...moduleGroups: string[][]): string[] => {
  const seenModules = new Set<string>()
  const mergedModules: string[] = []

  moduleGroups.forEach((group) => {
    group.forEach((moduleName) => {
      if (!moduleName?.trim()) return

      const normalizedName = normalizeModuleName(moduleName)
      if (seenModules.has(normalizedName)) return

      seenModules.add(normalizedName)
      mergedModules.push(moduleName.trim())
    })
  })

  return mergedModules
}

export const getRoleModules = ({
  loginType,
  apiModules = [],
  extraModules = [],
}: GetRoleModulesArgs): string[] => {
  const normalizedLoginType = loginType.toLowerCase()
  const baseModules =
    normalizedLoginType === "franchise" ||
    normalizedLoginType === "hub" ||
    normalizedLoginType === "staff"
      ? franchiseRoleModules
      : adminRoleModules

  const mergedModules = mergeModules(baseModules, apiModules, extraModules)

  if (normalizedLoginType === "hub") {
    return mergedModules.filter((moduleName) => !hubRestrictedModules.has(moduleName))
  }

  return mergedModules
}
