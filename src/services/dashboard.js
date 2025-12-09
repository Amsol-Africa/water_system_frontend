// ============================================
// FILE 9: frontend/src/services/dashboard.js (NEW)
// ============================================
import api from './api'

export const dashboardService = {
  getStats: async () => {
    return api.get('/dashboard/stats/')
  },

  getRecentActivity: async () => {
    return api.get('/dashboard/recent-activity/')
  },

  getCharts: async (period = 'week') => {
    return api.get('/dashboard/charts/', { params: { period } })
  },
}