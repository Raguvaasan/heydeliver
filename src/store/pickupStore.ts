import { create } from "zustand";
import http from "../common/httpRequest";
import toast from "react-hot-toast";

interface PickupSlot {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

interface PickupLocation {
  id: string;
  name: string;
  address: string;
}

interface Order {
  orderId: string;
  awb: string;
  manifestedDate: string;
  paymentMode: string;
  status: string;
}

interface PickupRequest {
  id: string;
  locationId: string;
  pickupDate: string;
  slotId: string;
  orderIds: string[];
  status: string;
  createdAt: string;
}

interface PickupStore {
  // State
  pickupRequests: PickupRequest[];
  pickupLocations: PickupLocation[];
  pickupSlots: PickupSlot[];
  readyOrders: Order[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchPickupRequests: () => Promise<void>;
  fetchPickupLocations: () => Promise<void>;
  fetchPickupSlots: (locationId: string) => Promise<void>;
  fetchReadyOrders: (locationId: string) => Promise<void>;
  createPickupRequest: (data: {
    locationId: string;
    pickupDate: string;
    slotId: string;
    orderIds: string[];
    saveAsDefault?: boolean;
  }) => Promise<boolean>;
  cancelPickupRequest: (id: string) => Promise<boolean>;
  resetError: () => void;
}

export const usePickupStore = create<PickupStore>((set, get) => ({
  // Initial State
  pickupRequests: [],
  pickupLocations: [],
  pickupSlots: [],
  readyOrders: [],
  loading: false,
  error: null,

  // Fetch all pickup requests
  fetchPickupRequests: async () => {
    set({ loading: true, error: null });
    try {
      const response = await http.get("/admin/pickup-requests");
      set({ pickupRequests: response.data.data || [], loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch pickup requests",
        loading: false,
      });
      toast.error("Failed to fetch pickup requests");
    }
  },

  // Fetch pickup locations
  fetchPickupLocations: async () => {
    set({ loading: true, error: null });
    try {
      const response = await http.get("/admin/pickup-locations");
      set({ pickupLocations: response.data.data || [], loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch pickup locations",
        loading: false,
      });
      toast.error("Failed to fetch pickup locations");
    }
  },

  // Fetch pickup slots for a location
  fetchPickupSlots: async (locationId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await http.get(`/admin/pickup-slots/${locationId}`);
      set({ pickupSlots: response.data.data || [], loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch pickup slots",
        loading: false,
      });
      toast.error("Failed to fetch pickup slots");
    }
  },

  // Fetch orders ready for pickup
  fetchReadyOrders: async (locationId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await http.get(`/admin/orders/ready-for-pickup/${locationId}`);
      set({ readyOrders: response.data.data || [], loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch ready orders",
        loading: false,
      });
      toast.error("Failed to fetch ready orders");
    }
  },

  // Create a new pickup request
  createPickupRequest: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await http.post("/admin/pickup-requests", data);
      
      // Add new pickup request to the list
      const newRequest = response.data.data;
      set((state) => ({
        pickupRequests: [...state.pickupRequests, newRequest],
        loading: false,
      }));

      toast.success("Pickup request created successfully");
      return true;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create pickup request",
        loading: false,
      });
      toast.error(error.response?.data?.message || "Failed to create pickup request");
      return false;
    }
  },

  // Cancel a pickup request
  cancelPickupRequest: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await http.delete(`/admin/pickup-requests/${id}`);
      
      // Remove from the list
      set((state) => ({
        pickupRequests: state.pickupRequests.filter((req) => req.id !== id),
        loading: false,
      }));

      toast.success("Pickup request cancelled successfully");
      return true;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to cancel pickup request",
        loading: false,
      });
      toast.error(error.response?.data?.message || "Failed to cancel pickup request");
      return false;
    }
  },

  // Reset error state
  resetError: () => set({ error: null }),
}));
