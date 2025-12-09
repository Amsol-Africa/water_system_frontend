// ============================================
// FILE 5: frontend/src/services/tokens.js (UPDATED)
// ============================================
import api from './api'

export const tokenService = {
  list: async (params = {}) => {
    return api.get('/tokens/', { params })
  },

  get: async (id) => {
    return api.get(`/tokens/${id}/`)
  },

  issue: async (data) => {
    return api.post('/tokens/issue/', {
      meter_id: data.meter_id,
      customer_id: data.customer_id,
      amount: parseFloat(data.amount),
      is_vend_by_unit: data.is_vend_by_unit || false,
    })
  },

  clearCredit: async (meterId, customerId) => {
    return api.post('/tokens/clear-credit/', {
      meter_id: meterId,
      customer_id: customerId,
    })
  },

  clearTamper: async (meterId, customerId) => {
    return api.post('/tokens/clear-tamper/', {
      meter_id: meterId,
      customer_id: customerId,
    })
  },

  resendSms: async (tokenId) => {
    return api.post(`/tokens/${tokenId}/resend-sms/`)
  },
}
