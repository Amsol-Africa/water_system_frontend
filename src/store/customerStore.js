// ============================================
// FILE 3: src/store/customerStore.js
// ============================================
import { create } from 'zustand'
import { customerService } from '@/services'

export const useCustomerStore = create((set, get) => ({
  // State
  customers: [],
  selectedCustomer: null,
  isLoading: false,
  error: null,
  filters: {
    search: '',
  },
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
  },

  // Actions
  fetchCustomers: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const { filters, pagination } = get()

      const response = await customerService.list({
        page: pagination.page,
        page_size: pagination.pageSize,
        search: filters.search || undefined,
        ...params,
      })

      set({
        customers: response.data.results || [],
        pagination: {
          ...get().pagination,
          total: response.data.count || 0,
        },
        isLoading: false,
      })
      return { success: true }
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to fetch customers'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },

  getCustomer: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await customerService.get(id)
      set({
        selectedCustomer: response.data,
        isLoading: false,
      })
      return { success: true, data: response.data }
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to fetch customer'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },

  createCustomer: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await customerService.create(data)
      set((state) => ({
        customers: [...state.customers, response.data],
        isLoading: false,
      }))
      return { success: true, data: response.data }
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to create customer'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },

  updateCustomer: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await customerService.update(id, data)
      set((state) => ({
        customers: state.customers.map((c) =>
          c.id === id ? response.data : c,
        ),
        selectedCustomer:
          state.selectedCustomer?.id === id
            ? response.data
            : state.selectedCustomer,
        isLoading: false,
      }))
      return { success: true, data: response.data }
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to update customer'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },

  deleteCustomer: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await customerService.delete(id)
      set((state) => ({
        customers: state.customers.filter((c) => c.id !== id),
        selectedCustomer:
          state.selectedCustomer?.id === id ? null : state.selectedCustomer,
        isLoading: false,
      }))
      return { success: true }
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to delete customer'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },

  // Assign a meter to this customer
// Assign a meter to this customer
assignMeter: async (customerId, meterId) => {
  set({ isLoading: true, error: null })
  try {
    const response = await customerService.assignMeter(customerId, meterId)

    // Refresh selected customer + list so meters_count stays in sync
    await get().getCustomer(customerId)
    await get().fetchCustomers()

    set({ isLoading: false })
    return { success: true, data: response.data }
  } catch (error) {
    const data = error.response?.data
    let message =
      data?.detail ||
      data?.message ||
      data?.error ||
      (data && typeof data === 'object'
        ? JSON.stringify(data)
        : 'Failed to assign meter')

    console.error('Assign meter failed', error.response?.status, data)
    set({ error: message, isLoading: false })
    return { success: false, error: message }
  }
},

// Unassign a meter (deactivate MeterAssignment)
unassignMeter: async (customerId, meterId) => {
  set({ isLoading: true, error: null })
  try {
    const response = await customerService.unassignMeter(customerId, meterId)

    await get().getCustomer(customerId)
    await get().fetchCustomers()

    set({ isLoading: false })
    return { success: true, data: response.data }
  } catch (error) {
    const data = error.response?.data
    let message =
      data?.detail ||
      data?.message ||
      data?.error ||
      (data && typeof data === 'object'
        ? JSON.stringify(data)
        : 'Failed to unassign meter')

    console.error('Unassign meter failed', error.response?.status, data)
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
