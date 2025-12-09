// ============================================
// FILE: src/store/paymentStore.js
// ============================================
import { create } from 'zustand'
import { paymentService } from '@/services'

export const usePaymentStore = create((set, get) => ({
  // State
  payments: [],
  selectedPayment: null,
  isLoading: false,
  error: null,

  filters: {
    search: '',   // mpesa tx id / phone / account_number
    status: '',   // pending / verified / failed / refunded
  },

  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
  },

  // Actions
  fetchPayments: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const state = get()
      const response = await paymentService.list({
        page: state.pagination.page,
        page_size: state.pagination.pageSize,
        // DRF SearchFilter uses ?search=
        search: state.filters.search || undefined,
        status: state.filters.status || undefined,
        ...params,
      })

      const { results = [], count = 0 } = response.data

      set((prev) => ({
        payments: results,
        pagination: {
          ...prev.pagination,
          total: count,
        },
        isLoading: false,
      }))

      return { success: true, data: results }
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to fetch payments'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },

  getPayment: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await paymentService.get(id)
      set({
        selectedPayment: response.data,
        isLoading: false,
      })
      return { success: true, data: response.data }
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to fetch payment'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },

  retryPayment: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await paymentService.retry(id)
      // After retry, refresh that payment list
      await get().fetchPayments()
      set({ isLoading: false })
      return { success: true, data: response.data }
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to retry payment'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },

  reconcilePayments: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await paymentService.reconcile()
      // Optionally refresh after reconcile
      await get().fetchPayments()
      set({ isLoading: false })
      return { success: true, data: response.data }
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to start reconciliation'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, page: 1 },
    }))
  },

  setPage: (page) => {
    set((state) => ({
      pagination: { ...state.pagination, page },
    }))
  },

  clearError: () => set({ error: null }),
}))
