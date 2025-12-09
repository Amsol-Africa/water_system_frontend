// ============================================
// FILE 2: frontend/src/services/auth.js (UPDATED)
// ============================================
import api from './api'

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login/', { email, password })
    
    // Store tokens
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access)
      localStorage.setItem('refresh_token', response.data.refresh)
    }
    
    return response
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        await api.post('/auth/logout/', { refresh: refreshToken })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
  },

  getCurrentUser: async () => {
    return api.get('/auth/me/')
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    const response = await api.post('/auth/refresh/', { refresh: refreshToken })
    
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access)
    }
    
    return response
  },
}