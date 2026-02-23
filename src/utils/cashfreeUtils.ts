/**
 * Cashfree Payment Gateway Utilities
 * Helper functions for integrating Cashfree payments
 */

// Cashfree SDK configuration
export const CASHFREE_CONFIG = {
  SDK_URL: "https://sdk.cashfree.com/js/v3/cashfree.js",
  SANDBOX_URL: "https://sandbox.cashfree.com",
  PRODUCTION_URL: "https://www.cashfree.com",
}

/**
 * Load Cashfree SDK dynamically
 * @returns Promise that resolves when SDK is loaded
 */
export const loadCashfreeSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.Cashfree) {
      resolve()
      return
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(
      `script[src="${CASHFREE_CONFIG.SDK_URL}"]`
    )
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve())
      existingScript.addEventListener("error", () =>
        reject(new Error("Failed to load Cashfree SDK"))
      )
      return
    }

    // Create and load script
    const script = document.createElement("script")
    script.src = CASHFREE_CONFIG.SDK_URL
    script.async = true

    script.onload = () => {
      resolve()
    }

    script.onerror = () => {
      reject(new Error("Failed to load Cashfree SDK"))
    }

    document.body.appendChild(script)
  })
}

/**
 * Initialize Cashfree payment
 * @param sessionId - Payment session ID from backend
 * @param paymentMethod - Payment method (upi, card, etc.)
 * @param returnUrl - URL to redirect after payment
 */
export const initiateCashfreePayment = async (
  sessionId: string,
  paymentMethod: "upi" | "card",
  returnUrl: string
) => {
  try {
    if (!window.Cashfree) {
      throw new Error("Cashfree SDK not loaded")
    }

    // Initialize Cashfree
    const cashfree = new window.Cashfree(sessionId)

    // Payment options
    const paymentOptions = {
      paymentMethod: paymentMethod === "card" ? "card" : "upi",
      returnUrl: returnUrl,
    }

    // Trigger payment redirect
    const result = await cashfree.redirect(paymentOptions)

    if (result?.error) {
      throw new Error(result.error.message || "Payment failed")
    }

    return result
  } catch (error: any) {
    throw error
  }
}

/**
 * Format amount for display
 * @param amount - Amount in rupees
 * @returns Formatted string with rupee symbol
 */
export const formatAmount = (amount: number): string => {
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Validate payment amount
 * @param amount - Amount to validate
 * @param minAmount - Minimum allowed amount (default: 100)
 * @param maxAmount - Maximum allowed amount (default: 100000)
 * @returns Object with isValid flag and error message
 */
export const validatePaymentAmount = (
  amount: number,
  minAmount: number = 100,
  maxAmount: number = 100000
): { isValid: boolean; error?: string } => {
  if (isNaN(amount) || amount <= 0) {
    return { isValid: false, error: "Please enter a valid amount" }
  }

  if (amount < minAmount) {
    return {
      isValid: false,
      error: `Minimum amount is ${formatAmount(minAmount)}`,
    }
  }

  if (amount > maxAmount) {
    return {
      isValid: false,
      error: `Maximum amount is ${formatAmount(maxAmount)}`,
    }
  }

  return { isValid: true }
}

/**
 * Parse query parameters from URL
 * @param url - URL string or search params
 * @returns Object with parsed parameters
 */
export const parsePaymentCallback = (searchParams: URLSearchParams) => {
  return {
    orderId: searchParams.get("order_id"),
    paymentId: searchParams.get("payment_id"),
    status: searchParams.get("status"),
    referenceId: searchParams.get("reference_id"),
  }
}

/**
 * Get payment method display name
 */
export const getPaymentMethodName = (method: string): string => {
  const methodNames: Record<string, string> = {
    upi: "UPI / Net Banking",
    card: "Credit / Debit Card",
    netbanking: "Net Banking",
    wallet: "Wallet",
  }
  return methodNames[method] || method
}

/**
 * Payment status badges
 */
export const getPaymentStatusColor = (
  status: string
): "success" | "failure" | "warning" | "info" => {
  const statusColors: Record<string, "success" | "failure" | "warning" | "info"> = {
    completed: "success",
    success: "success",
    failed: "failure",
    failure: "failure",
    pending: "warning",
    processing: "info",
  }
  return statusColors[status.toLowerCase()] || "info"
}

/**
 * Quick amount presets
 */
export const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000]

/**
 * Transaction type labels
 */
export const TRANSACTION_TYPES = {
  credit: "Credit",
  debit: "Debit",
  refund: "Refund",
  reversal: "Reversal",
}

/**
 * Format date for transaction display
 */
export const formatTransactionDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins} mins ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays < 7) return `${diffDays} days ago`

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

/**
 * Generate return URL for payment
 */
export const generateReturnUrl = (orderId: string): string => {
  const baseUrl = window.location.origin
  return `${baseUrl}/admin/wallet/payment-callback?order_id=${orderId}`
}

// Type definitions for TypeScript
declare global {
  interface Window {
    Cashfree: any
  }
}

export default {
  loadCashfreeSDK,
  initiateCashfreePayment,
  formatAmount,
  validatePaymentAmount,
  parsePaymentCallback,
  getPaymentMethodName,
  getPaymentStatusColor,
  formatTransactionDate,
  generateReturnUrl,
  QUICK_AMOUNTS,
  TRANSACTION_TYPES,
}
