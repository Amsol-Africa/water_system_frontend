// ============================================
// FILE: src/store/userStore.js
// ============================================
import { create } from 'zustand'
import { userService } from '@/services'

export const useUserStore = create((set, get) => ({
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null,
  filters: {
    search: '',
    role: '',
    status: '',
  },
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
  },

  fetchUsers: async (params = {}) => {
    set({ isLoading: true, error: null })
    try {
      const response = await userService.list({
        page: get().pagination.page,
        page_size: get().pagination.pageSize,
        ...get().filters,
        ...params,
      })
      const { results = [], count = 0 } = response.data
      set((state) => ({
        users: results,
        pagination: { ...state.pagination, total: count },
        isLoading: false,
      }))
      return { success: true, data: results }
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to fetch users'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },

  getUser: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await userService.get(id)
      set({ selectedUser: response.data, isLoading: false })
      return { success: true, data: response.data }
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to fetch user'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },

  createUser: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await userService.create(data)
      set((state) => ({
        users: [response.data, ...state.users],
        isLoading: false,
      }))
      return { success: true, data: response.data }
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to create user'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },

  updateUser: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await userService.update(id, data)
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? response.data : u)),
        selectedUser:
          state.selectedUser?.id === id ? response.data : state.selectedUser,
        isLoading: false,
      }))
      return { success: true, data: response.data }
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to update user'
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },

  setUserActive: async (id, isActive) => {
    set({ isLoading: true, error: null })
    try {
      const response = await userService.setActive(id, isActive)
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? response.data : u)),
        selectedUser:
          state.selectedUser?.id === id ? response.data : state.selectedUser,
        isLoading: false,
      }))
      return { success: true, data: response.data }
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to update user status'
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
