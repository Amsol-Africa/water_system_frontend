// ============================================
// FILE: src/services/users.js
// ============================================
import api from './api'

export const userService = {
  list: async (params = {}) => {
    return api.get('/auth/users/', { params })
  },

  get: async (id) => {
    return api.get(`/auth/users/${id}/`)
  },

  create: async (data) => {
    return api.post('/auth/users/', data)
  },

  update: async (id, data) => {
    return api.patch(`/auth/users/${id}/`, data)
  },

  setActive: async (id, isActive) => {
    return api.patch(`/auth/users/${id}/`, { is_active: isActive })
  },
}
