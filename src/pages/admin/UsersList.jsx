// ============================================
// FILE: src/pages/admin/UsersList.jsx
// ============================================
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/store'
import Card from '@/components/common/Card'
import Table from '@/components/common/Table'
import Button from '@/components/common/Button'
import Badge from '@/components/common/Badge'
import Input from '@/components/common/Input'
import Alert from '@/components/common/Alert'
import { formatDateTime } from '@/utils/formatters'
import { Plus, Search } from 'lucide-react'

const UsersList = () => {
  const navigate = useNavigate()
  const {
    users,
    isLoading,
    error,
    fetchUsers,
    clearError,
    setFilters,
  } = useUserStore()

  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleFilterChange = async () => {
    setFilters({ search, role, status })
    await fetchUsers({ search, role, status })
  }

  const columns = [
    {
      key: 'email',
      label: 'Email',
      render: (v, row) => (
        <div>
          <p className="text-sm font-medium text-slate-900">{v}</p>
          <p className="text-xs text-slate-500">
            {row.first_name} {row.last_name}
          </p>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (v) => (
        <Badge className="bg-blue-50 text-blue-700 border-blue-200">
          {v}
        </Badge>
      ),
    },
    {
      key: 'client_name',
      label: 'Client',
      render: (v) => <span className="text-sm">{v || '-'}</span>,
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (v) => (
        <Badge
          className={
            v
              ? 'bg-green-100 text-green-800 border-green-300'
              : 'bg-gray-100 text-gray-600 border-gray-300'
          }
        >
          {v ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'last_login',
      label: 'Last Login',
      render: (v) => (
        <span className="text-xs text-slate-500">
          {v ? formatDateTime(v) : '-'}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Users</h1>
          <p className="mt-1 text-slate-600">
             Manage system admins, client admins, operators, engineers, and read-only users.
          </p>
        </div>
        <Button
          onClick={() => navigate('/admin/users/new')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card className="space-y-4">
        {error && (
          <Alert
            type="error"
            title="Error"
            message={error}
            onClose={clearError}
          />
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Input
              placeholder="Search by email, name, or phone..."
              icon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onBlur={handleFilterChange}
            />
          </div>
          <div>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value)
                setTimeout(handleFilterChange, 0)
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Roles</option>
              <option value="system_admin">System Admin</option>
              <option value="client_admin">Client Admin</option>
              <option value="operator">Operator</option>
              <option value="field_engineer">Field Engineer</option>
              <option value="read_only">Read Only Viewer</option>
            </select>
          </div>
          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setTimeout(handleFilterChange, 0)
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          data={users}
          loading={isLoading}
          onRowClick={(row) => navigate(`/admin/users/${row.id}`)}
        />
        {!isLoading && users.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-500">
            No users found for the current filters.
          </p>
        )}
      </Card>
    </div>
  )
}

export default UsersList
