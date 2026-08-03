import { describe, expect, it } from "vitest"
import { resolveParcelAccess } from "./parcelBookingRole"

describe("resolveParcelAccess", () => {
  it("treats franchise logins as branch users for parcel status updates", () => {
    const access = resolveParcelAccess("franchise", {
      role: { name: "franchise", roleName: "franchise" },
    })

    expect(access.isBranch).toBe(true)
    expect(access.isHub).toBe(false)
    expect(access.isAdmin).toBe(false)
  })

  it("treats hub logins as hub users for parcel status updates", () => {
    const access = resolveParcelAccess("hub", {
      role: { name: "hub", roleName: "hub" },
    })

    expect(access.isHub).toBe(true)
    expect(access.isBranch).toBe(false)
    expect(access.isAdmin).toBe(false)
  })
})
