
// ============================================
// FILE 6: src/pages/NotFound.jsx
// ============================================
import React from 'react'
import { Link } from 'react-router-dom'
import Button from '@/components/common/Button'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
        <p className="text-xl text-slate-600 mb-8">Page not found</p>
        <Link to="/dashboard">
          <Button>Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}

export default NotFound
