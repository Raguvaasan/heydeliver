const adminRoleModules = [
  "Dashboard",
  "Agency",
  "Hub",
  "Route",
  "Orders",
  "Vehicle",
  "Driver",
  "Customers",
  "Access Management",
  "Settings",
  "Careers",
]

const franchiseRoleModules = [
   "Dashboard",
  "Agency",
  "Hub",
  "Route",
  "Orders",
  "Vehicle",
  "Driver",
  "Customers",
  "Access Management",
  "Settings",
  "Careers",
]

const hubRestrictedModules = new Set(["Wallet", "Reports"])

interface GetRoleModulesArgs {
  loginType: string
  apiModules?: string[]
  extraModules?: string[]
}

const normalizeModuleName = (moduleName: unknown): string => {
  if (typeof moduleName !== "string") {
    return ""
  }

  return moduleName.trim().toLowerCase()
}

const mergeModules = (...moduleGroups: string[][]): string[] => {
  const seenModules = new Set<string>()
  const mergedModules: string[] = []

  moduleGroups.forEach((group) => {
    group.forEach((moduleName) => {
      if (typeof moduleName !== "string" || !moduleName.trim()) return

      const normalizedName = normalizeModuleName(moduleName)
      if (seenModules.has(normalizedName)) return

      seenModules.add(normalizedName)
      mergedModules.push(moduleName.trim())
    })
  })

  return mergedModules
}

const buildAllowedModuleSet = (modules: string[]): Set<string> =>
  new Set(modules.map((moduleName) => normalizeModuleName(moduleName)).filter(Boolean))

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

  const allowedModules = buildAllowedModuleSet(baseModules)
  const filteredApiModules = apiModules.filter((moduleName) =>
    allowedModules.has(normalizeModuleName(moduleName))
  )
  const filteredExtraModules = extraModules.filter((moduleName) =>
    allowedModules.has(normalizeModuleName(moduleName))
  )

  const mergedModules = mergeModules(baseModules, filteredApiModules, filteredExtraModules)

  if (normalizedLoginType === "hub") {
    return mergedModules.filter((moduleName) => !hubRestrictedModules.has(moduleName))
  }

  return mergedModules
}
