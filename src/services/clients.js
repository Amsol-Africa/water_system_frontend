// ============================================
// FILE 8: frontend/src/services/clients.js (NEW)
// ============================================
import api from './api'

export const clientService = {
  list: async (params = {}) => {
    return api.get('/clients/', { params })
  },

  get: async (id) => {
    return api.get(`/clients/${id}/`)
  },

  create: async (data) => {
    return api.post('/clients/', data)
  },

  update: async (id, data) => {
    return api.patch(`/clients/${id}/`, data)
  },

  delete: async (id) => {
    return api.delete(`/clients/${id}/`)
  },

  getStats: async (id) => {
    return api.get(`/clients/${id}/stats/`)
  },
}