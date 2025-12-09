// ============================================
//     frontend/src/services/customers.js 
// ============================================
import api from './api'

export const customerService = {
  list: async (params = {}) => {
    return api.get('/customers/', { params })
  },

  get: async (id) => {
    return api.get(`/customers/${id}/`)
  },

  create: async (data) => {
    return api.post('/customers/', data)
  },

  update: async (id, data) => {
    return api.patch(`/customers/${id}/`, data)
  },

  delete: async (id) => {
    return api.delete(`/customers/${id}/`)
  },

  assignMeter: async (customerId, meterId) => {
    return api.post(`/customers/${customerId}/assign-meter/`, { meter_id: meterId })
  },

  unassignMeter: async (customerId, meterId) => {
    return api.post(`/customers/${customerId}/unassign-meter/`, { meter_id: meterId })
  },
}