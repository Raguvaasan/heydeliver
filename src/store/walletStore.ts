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
  userId?: string
  userName?: string
  franchiseName?: string
  user?: {
    _id?: string
    name?: string
    firstName?: string
    lastName?: string
    email?: string
    agencyName?: string
  }
  franchise?: {
    _id?: string
    agencyName?: string
    name?: string
  }
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
  fetchAllFranchiseTransactions: () => Promise<void>
  fetchAllFranchiseRecharges: () => Promise<void>
  createPaymentOrder: (amount: number, paymentMethod: string) => Promise<any>
  verifyPayment: (orderId: string, paymentId?: string) => Promise<void>
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

  fetchAllFranchiseTransactions: async () => {
    set({ loading: true, error: null })
    try {
      // Admin users: Fetch all franchise transactions from backend
      // Backend automatically returns all franchise data for admin users
      const response = await httpRequest.get("/wallet/transactions", {
        params: { 
          page: 1,
          limit: 50  // Get more records to show all franchises
        }
      })
      console.log('Admin franchise transactions response:', response.data)
      set({ transactions: response.data?.transactions || [], loading: false })
    } catch (error: any) {
      console.error('Fetch franchise transactions error:', error)
      const errorMsg = error.response?.data?.message || "Failed to fetch franchise transactions"
      set({ error: errorMsg, loading: false })
    }
  },

  fetchAllFranchiseRecharges: async () => {
    set({ loading: true, error: null })
    try {
      // Admin users: Fetch only credit transactions (recharges) from all franchises
      // Backend automatically returns all franchise data for admin users
      const response = await httpRequest.get("/wallet/transactions", {
        params: { 
          type: 'credit',
          page: 1,
          limit: 20
        }
      })
      console.log('Admin franchise recharges response:', response.data)
      set({ transactions: response.data?.transactions || [], loading: false })
    } catch (error: any) {
      console.error('Fetch franchise recharges error:', error)
      const errorMsg = error.response?.data?.message || "Failed to fetch franchise recharges"
      set({ error: errorMsg, loading: false })
    }
  },

  createPaymentOrder: async (amount: number, paymentMethod: string) => {
    set({ paymentLoading: true, error: null })
    try {
      console.log('Creating payment order:', { amount, paymentMethod })
      
      // Validate amount
      if (!amount || amount <= 0) {
        throw new Error('Invalid amount')
      }
      
      if (!paymentMethod) {
        throw new Error('Payment method is required')
      }
      
      const response = await httpRequest.post("/wallet/create-payment-order", {
        amount,
        paymentMethod,
      })
      
      console.log('Payment order response:', response.data)
      set({ paymentLoading: false })
      return response.data
    } catch (error: any) {
      console.error('Payment order error:', error)
      const errorMsg = error.response?.data?.message || error.message || "Failed to create payment order"
      set({ error: errorMsg, paymentLoading: false })
      toast.error(errorMsg)
      throw error
    }
  },

  verifyPayment: async (orderId: string, paymentId?: string) => {
    try {
      console.log('🔍 Verifying payment:', { orderId, paymentId })
      
      const payload: any = { orderId }
      if (paymentId) {
        payload.paymentId = paymentId
      }
      
      const response = await httpRequest.post("/wallet/verify-payment", payload)
      
      console.log('✅ Verify response:', response.data)
      
      if (response.data?.success && response.data?.status === "SUCCESS") {
        // Refresh balance after successful payment
        await get().fetchBalance()
        toast.success(`Payment successful! ₹${response.data.amount} added. New balance: ₹${response.data.newBalance}`)
      } else {
        toast.error(response.data?.message || "Payment verification failed")
        throw new Error(response.data?.message || "Payment verification failed")
      }
    } catch (error: any) {
      console.error('❌ Verification error:', error)
      const errorMsg = error.response?.data?.message || error.message || "Payment verification failed"
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
