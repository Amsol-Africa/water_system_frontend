
import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="mx-auto max-w-7xl px-4 py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
