export const buildQueryString = (params: any) => {
  const queryParams = []

  // Iterate over the object properties
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === "") {
      continue // Skip empty or invalid values
    }

    // Handle arrays (e.g., `month`)
    if (Array.isArray(value) && value.length > 0) {
      queryParams.push(`${key}=${value.join(",")}`)
    }
    // Handle non-array values
    else if (value !== "all") {
      // Skip 'all' values
      queryParams.push(`${key}=${value}`)
    }
  }

  // Join the query parameters with '&'
  return queryParams.length > 0 ? `?${queryParams.join("&")}` : ""
}
