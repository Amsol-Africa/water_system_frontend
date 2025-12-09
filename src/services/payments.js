// ============================================
// FILE 6: frontend/src/services/payments.js (UPDATED)
// ============================================
import api from './api'

export const paymentService = {
  list: async (params = {}) => {
    return api.get('/payments/', { params })
  },

  get: async (id) => {
    return api.get(`/payments/${id}/`)
  },

  retry: async (id) => {
    return api.post(`/payments/${id}/retry/`)
  },

  reconcile: async () => {
    return api.post('/payments/reconcile/')
  },
}