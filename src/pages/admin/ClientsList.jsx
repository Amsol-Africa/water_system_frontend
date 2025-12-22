import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'

import Card from '@/components/common/Card'
import Table from '@/components/common/Table'
import Button from '@/components/common/Button'
import Badge from '@/components/common/Badge'
import Input from '@/components/common/Input'
import Alert from '@/components/common/Alert'
import { useClientStore } from '@/store'

const ClientsList = () => {
  const navigate = useNavigate()
  const { clients, isLoading, error, fetchClients, clearError, setFilters } = useClientStore()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const handleFilterChange = async () => {
    setFilters({ search, status })
    await fetchClients({ search, status })
  }

  const columns = [
    {
      key: 'name',
      label: 'Client',
      render: (v, row) => (
        <div>
          <p className="text-sm font-medium text-slate-900">{v}</p>
          <p className="text-xs text-slate-500">Paybill: {row.paybill_number}</p>
        </div>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (v) => (
        <Badge
          className={
            v ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-100 text-gray-600 border-gray-300'
          }
        >
          {v ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'meters_count',
      label: 'Meters',
      render: (v) => <span className="text-sm">{v ?? 0}</span>,
    },
    {
      key: 'customers_count',
      label: 'Customers',
      render: (v) => <span className="text-sm">{v ?? 0}</span>,
    },
    {
      key: 'users_count',
      label: 'Users',
      render: (v) => <span className="text-sm">{v ?? 0}</span>,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clients</h1>
          <p className="mt-1 text-slate-600">Paybill owners (tenants) and Stronpower credentials.</p>
        </div>
        <Button onClick={() => navigate('/admin/clients/new')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </div>

      <Card className="space-y-4">
        {error && <Alert type="error" title="Error" message={error} onClose={clearError} />}

        <div className="grid gap-4 md:grid-cols-3">
          <Input
            placeholder="Search by client name or paybill..."
            icon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onBlur={handleFilterChange}
          />

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
      </Card>

      <Card>
        <Table
          columns={columns}
          data={clients}
          loading={isLoading}
          onRowClick={(row) => navigate(`/admin/clients/${row.id}`)}
        />
        {!isLoading && clients.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-500">No clients found.</p>
        )}
      </Card>
    </div>
  )
}

export default ClientsList
