// ============================================
// FILE 10: frontend/src/services/reports.js (NEW)
// ============================================
import api from './api'

export const reportService = {
  transactions: async (params = {}) => {
    return api.get('/reports/transactions/', {
      params,
      responseType: 'blob',
    })
  },

  meterUsage: async (params = {}) => {
    return api.get('/reports/meter-usage/', {
      params,
      responseType: 'blob',
    })
  },

  tokens: async (params = {}) => {
    return api.get('/reports/tokens/', {
      params,
      responseType: 'blob',
    })
  },

  tamperEvents: async (params = {}) => {
    return api.get('/reports/tamper-events/', {
      params,
      responseType: 'blob',
    })
  },
}
