// ============================================
// FILE 2: src/components/auth/AdminRoute.jsx
// ============================================
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks'
import { USER_ROLES } from '@/utils/constants'

const AdminRoute = ({ children, requiredRole = USER_ROLES.SYSTEM_ADMIN }) => {
  const { isAuthenticated, user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Allow system admin to access everything
  if (user?.role === USER_ROLES.SYSTEM_ADMIN) {
    return children
  }

  // Check specific role requirement
  if (user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default AdminRoute