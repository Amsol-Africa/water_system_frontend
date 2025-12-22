// ============================================
// FILE: frontend/src/services/clients.js (NEW)
// ============================================
import api from './api'

export const clientService = {
  list: async (params = {}) => api.get('/clients/', { params }),
  retrieve: async (id) => api.get(`/clients/${id}/`),
  create: async (data) => api.post('/clients/', data),
  update: async (id, data) => api.patch(`/clients/${id}/`, data),
  remove: async (id) => api.delete(`/clients/${id}/`),
  stats: async (id) => api.get(`/clients/${id}/stats/`),
}
