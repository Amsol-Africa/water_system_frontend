// ============================================
// FILE 3: frontend/src/services/meters.js (UPDATED)
// ============================================
import api from './api'

export const meterService = {
  list: async (params = {}) => {
    return api.get('/meters/', { params })
  },

  get: async (id) => {
    return api.get(`/meters/${id}/`)
  },

  create: async (data) => {
    return api.post('/meters/', data)
  },

  update: async (id, data) => {
    return api.patch(`/meters/${id}/`, data)
  },

  delete: async (id) => {
    return api.delete(`/meters/${id}/`)
  },

  query: async (meterId) => {
    return api.post('/meters/query/', { meter_id: meterId })
  },

  suspend: async (id) => {
    return api.post(`/meters/${id}/suspend/`)
  },

  resume: async (id) => {
    return api.post(`/meters/${id}/resume/`)
  },

  getAssignments: async (meterId) => {
    return api.get(`/meters/${meterId}/assignments/`)
  },
}