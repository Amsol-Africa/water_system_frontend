// src/App.jsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { PrivateRoute } from '@/components/auth'
import { Layout } from '@/components/layout'
import { useAuth } from '@/hooks'

// Pages
import Login from '@/pages/auth/Login'
import Dashboard from '@/pages/dashboard/Dashboard'
import MetersList from '@/pages/meters/MetersList'
import MeterDetail from '@/pages/meters/MeterDetail'
import MeterForm from '@/pages/meters/MeterForm'
import CustomersList from '@/pages/customers/CustomersList'
import CustomerForm from '@/pages/customers/CustomerForm'
import CustomerDetail from '@/pages/customers/CustomerDetail'
import TokensList from '@/pages/tokens/TokensList'
import IssueToken from '@/pages/tokens/IssueToken'
import PaymentsList from '@/pages/payments/PaymentsList'
import AlertsList from '@/pages/alerts/AlertsList'
import SettingsPage from '@/pages/settings/SettingsPage'
import ReportsPage from '@/pages/reports/ReportsPage'
import NotFound from '@/pages/NotFound'

// Admin pages
import UsersList from '@/pages/admin/UsersList'
import UserForm from '@/pages/admin/UserForm'
import ClientsList from '@/pages/admin/ClientsList'
import ClientForm from '@/pages/admin/ClientForm'

export default function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      {/* Protected */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Meters */}
        <Route path="meters" element={<MetersList />} />
        <Route path="meters/new" element={<MeterForm />} />
        <Route path="meters/:id" element={<MeterDetail />} />
        <Route path="meters/:id/edit" element={<MeterForm />} />

        {/* Customers */}
        <Route path="customers" element={<CustomersList />} />
        <Route path="customers/new" element={<CustomerForm />} />
        <Route path="customers/:id" element={<CustomerDetail />} />

        {/* Tokens */}
        <Route path="tokens" element={<TokensList />} />
        <Route path="tokens/issue" element={<IssueToken />} />

        {/* Payments / Alerts / Settings / Reports */}
        <Route path="payments" element={<PaymentsList />} />
        <Route path="alerts" element={<AlertsList />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="reports" element={<ReportsPage />} />

        {/* Admin (still uses the SAME Layout / Sidebar / Header) */}
        <Route path="admin/clients" element={<ClientsList />} />
        <Route path="admin/clients/new" element={<ClientForm />} />
        <Route path="admin/clients/:id" element={<ClientForm />} />

        <Route path="admin/users" element={<UsersList />} />
        <Route path="admin/users/new" element={<UserForm />} />
        <Route path="admin/users/:id" element={<UserForm />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
