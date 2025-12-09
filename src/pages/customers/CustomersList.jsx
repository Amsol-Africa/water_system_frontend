// src/pages/customers/CustomersList.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCustomerStore } from '@/store'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Table from '@/components/common/Table'
import Input from '@/components/common/Input'
import { Plus, Search } from 'lucide-react'
import { formatDateTime, formatCurrency } from '@/utils/formatters'

const CustomersList = () => {
  const navigate = useNavigate()
  const { customers, isLoading, fetchCustomers } = useCustomerStore()
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const filteredCustomers = customers.filter((customer) => {
    const q = search.toLowerCase()
    return (
      customer.name?.toLowerCase().includes(q) ||
      customer.phone?.includes(search) ||
      customer.customer_id?.toLowerCase().includes(q)
    )
  })

  const columns = [
    {
      key: 'customer_id',
      label: 'ID',
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'name',
      label: 'Name',
      render: (value) => <span>{value}</span>,
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value) => <span>{value || '-'}</span>,
    },
    {
      key: 'email',
      label: 'Email',
      render: (value) => <span className="text-sm">{value || '-'}</span>,
    },
    {
      key: 'meters_count',
      label: 'Meters',
      render: (value) => (
        <span className="text-sm font-medium">{value ?? 0}</span>
      ),
    },
    {
      key: 'total_paid',
      label: 'Total Spend',
      render: (value) => (
        <span className="text-sm font-medium">
          {formatCurrency(value || 0, { currency: 'KES', locale: 'en-KE' })}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value) => (
        <span className="text-sm text-slate-500">
          {formatDateTime(value)}
        </span>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-600 mt-1">
            Manage customer accounts, meters, and spending
          </p>
        </div>
        <Button
          onClick={() => navigate('/customers/new')}
          className="flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <Input
          placeholder="Search by name, phone, or customer ID..."
          icon={<Search className="w-4 h-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          data={filteredCustomers}
          loading={isLoading}
          onRowClick={(customer) => navigate(`/customers/${customer.id}`)}
        />
        {!isLoading && filteredCustomers.length === 0 && (
          <p className="text-center text-sm text-slate-500 py-6">
            No customers found for the current search.
          </p>
        )}
      </Card>
    </div>
  )
}

export default CustomersList
