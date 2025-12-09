// ============================================
// FILE 7: frontend/src/services/alerts.js (NEW)
// ============================================
import api from './api'

export const alertService = {
  list: async (params = {}) => {
    return api.get('/alerts/', { params })
  },

  get: async (id) => {
    return api.get(`/alerts/${id}/`)
  },

  acknowledge: async (id) => {
    return api.post(`/alerts/${id}/acknowledge/`)
  },
  
}
