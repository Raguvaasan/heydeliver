import { create } from "zustand"
import httpRequest from "../common/httpRequest"
import toast from "react-hot-toast"

interface Transaction {
  id: string
  amount: number
  type: "credit" | "debit"
  status: "pending" | "completed" | "failed"
  description: string
  createdAt: string
  orderId?: string
  paymentMethod?: string
}

interface WalletState {
  balance: number
  transactions: Transaction[]
  loading: boolean
  error: string | null
  paymentLoading: boolean

  // Actions
  fetchBalance: () => Promise<void>
  fetchTransactions: () => Promise<void>
  createPaymentOrder: (amount: number, paymentMethod: string) => Promise<any>
  verifyPayment: (orderId: string, paymentId: string) => Promise<void>
  addMoneyToWallet: (amount: number, transactionId: string) => Promise<void>
}

export const useWalletStore = create<WalletState>((set, get) => ({
  balance: 0,
  transactions: [],
  loading: false,
  error: null,
  paymentLoading: false,

  fetchBalance: async () => {
    set({ loading: true, error: null })
    try {
      const response = await httpRequest.get("/wallet/balance")
      set({ balance: response.data?.balance || 0, loading: false })
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Failed to fetch wallet balance"
      set({ error: errorMsg, loading: false })
      toast.error(errorMsg)
    }
  },

  fetchTransactions: async () => {
    set({ loading: true, error: null })
    try {
      const response = await httpRequest.get("/wallet/transactions")
      set({ transactions: response.data?.transactions || [], loading: false })
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Failed to fetch transactions"
      set({ error: errorMsg, loading: false })
    }
  },

  createPaymentOrder: async (amount: number, paymentMethod: string) => {
    set({ paymentLoading: true, error: null })
    try {
      const response = await httpRequest.post("/wallet/create-payment-order", {
        amount,
        paymentMethod,
      })
      set({ paymentLoading: false })
      return response.data
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Failed to create payment order"
      set({ error: errorMsg, paymentLoading: false })
      toast.error(errorMsg)
      throw error
    }
  },

  verifyPayment: async (orderId: string, paymentId: string) => {
    try {
      const response = await httpRequest.post("/wallet/verify-payment", {
        orderId,
        paymentId,
      })
      
      if (response.data?.success) {
        // Refresh balance after successful payment
        await get().fetchBalance()
        toast.success("Payment successful! Wallet recharged.")
      } else {
        toast.error("Payment verification failed")
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Payment verification failed"
      toast.error(errorMsg)
      throw error
    }
  },

  addMoneyToWallet: async (amount: number, transactionId: string) => {
    try {
      const response = await httpRequest.post("/wallet/add-money", {
        amount,
        transactionId,
      })
      
      if (response.data?.success) {
        await get().fetchBalance()
        await get().fetchTransactions()
        toast.success(`₹${amount} added to wallet successfully!`)
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Failed to add money to wallet"
      toast.error(errorMsg)
      throw error
    }
  },
}))
