// ============================================
// FILE: src/pages/reports/ReportsPage.jsx
// ============================================
import React, { useEffect, useState } from 'react'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Alert from '@/components/common/Alert'
import Table from '@/components/common/Table'
import Badge from '@/components/common/Badge'
import {
  formatDate,
  formatDateTime,
  formatCurrency,
  getStatusColor,
} from '@/utils/formatters'
import { reportService } from '@/services'
import { useCustomerStore, useMeterStore, useTokenStore, usePaymentStore } from '@/store'
import { Download, Filter, RefreshCcw } from 'lucide-react'

const REPORT_TABS = [
  { key: 'transactions', label: 'Transactions' },
  { key: 'meterUsage', label: 'Meter Usage' },
  { key: 'tokens', label: 'Tokens' },
  { key: 'tamperEvents', label: 'Tamper Events' },
]

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('transactions')
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    customer_id: '',
    meter_id: '',
    status: '',
    min_amount: '',
    max_amount: '',
  })
  const [exportLoading, setExportLoading] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [error, setError] = useState(null)
  const [previewRows, setPreviewRows] = useState([])

  const { customers, fetchCustomers } = useCustomerStore()
  const { meters, fetchMeters } = useMeterStore()
  const { tokens, fetchTokens } = useTokenStore()
  const { payments, fetchPayments } = usePaymentStore?.() || {
    payments: [],
    fetchPayments: async () => {},
  }

  // Load base data for filters
  useEffect(() => {
    fetchCustomers({ page_size: 100 })
    fetchMeters({ page_size: 100 })
    fetchTokens?.({ page_size: 50 })
    fetchPayments?.({ page_size: 50 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateFilter = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const buildParams = () => {
    const params = {}
    if (filters.date_from) params.date_from = filters.date_from
    if (filters.date_to) params.date_to = filters.date_to
    if (filters.customer_id) params.customer_id = filters.customer_id
    if (filters.meter_id) params.meter_id = filters.meter_id
    if (filters.status) params.status = filters.status
    if (filters.min_amount) params.min_amount = filters.min_amount
    if (filters.max_amount) params.max_amount = filters.max_amount
    return params
  }

  const handleExport = async () => {
    setError(null)
    setExportLoading(true)
    try {
      const params = buildParams()
      let response
      switch (activeTab) {
        case 'transactions':
          response = await reportService.transactions(params)
          break
        case 'meterUsage':
          response = await reportService.meterUsage(params)
          break
        case 'tokens':
          response = await reportService.tokens(params)
          break
        case 'tamperEvents':
          response = await reportService.tamperEvents(params)
          break
        default:
          throw new Error('Unknown report type')
      }

      const blob = new Blob([response.data], {
        type:
          response.headers['content-type'] ||
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      const today = new Date().toISOString().slice(0, 10)
      link.href = url
      link.download = `${activeTab}-report-${today}.xlsx`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      setError('Failed to export report. Please try again.')
    } finally {
      setExportLoading(false)
    }
  }

  // Optional: simple preview using existing lists (not from /reports/*)
  const handlePreview = async () => {
    setError(null)
    setPreviewLoading(true)
    try {
      const params = buildParams()
      switch (activeTab) {
        case 'transactions':
          // Use payments store for a quick preview
          await fetchPayments?.(params)
          setPreviewRows(payments || [])
          break
        case 'tokens':
          await fetchTokens?.(params)
          setPreviewRows(tokens || [])
          break
        case 'meterUsage':
          // You can later swap this with a dedicated /meters/usage endpoint
          setPreviewRows([])
          break
        case 'tamperEvents':
          setPreviewRows([])
          break
        default:
          setPreviewRows([])
      }
    } catch (err) {
      console.error(err)
      setError('Failed to load preview data.')
    } finally {
      setPreviewLoading(false)
    }
  }

  // Columns per report type
  const columnsByTab = {
    transactions: [
      {
        key: 'mpesa_transaction_id',
        label: 'Txn ID',
        render: (v) => <span className="font-mono text-xs">{v}</span>,
      },
      {
        key: 'amount',
        label: 'Amount',
        render: (v) => <span>{formatCurrency(v, { currency: 'KES', locale: 'en-KE' })}</span>,
      },
      {
        key: 'phone',
        label: 'Phone',
        render: (v) => <span>{v}</span>,
      },
      {
        key: 'status',
        label: 'Status',
        render: (v) => (
          <Badge className={getStatusColor(v, 'payment')}>
            {v}
          </Badge>
        ),
      },
      {
        key: 'received_at',
        label: 'Received',
        render: (v) => (
          <span className="text-xs text-slate-500">{formatDateTime(v)}</span>
        ),
      },
    ],
    tokens: [
      {
        key: 'token_value',
        label: 'Token',
        render: (v) =>
          v ? (
            <span className="font-mono text-xs">
              {String(v).substring(0, 15)}...
            </span>
          ) : (
            <span className="text-slate-400">N/A</span>
          ),
      },
      {
        key: 'meter_id',
        label: 'Meter',
        render: (v, row) => <span>{row.meter_id || row.meter?.meter_id}</span>,
      },
      {
        key: 'customer_name',
        label: 'Customer',
        render: (v, row) => <span>{v || row.customer_name || '-'}</span>,
      },
      {
        key: 'amount',
        label: 'Amount / Units',
        render: (v, row) => (
          <span className="text-xs">
            {row.is_vend_by_unit
              ? `${row.units} units`
              : `KES ${row.amount}`}
          </span>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        render: (v) => (
          <Badge className={getStatusColor(v, 'token')}>
            {v}
          </Badge>
        ),
      },
      {
        key: 'created_at',
        label: 'Created',
        render: (v) => (
          <span className="text-xs text-slate-500">{formatDateTime(v)}</span>
        ),
      },
    ],
    meterUsage: [
      // Placeholder – if you later have JSON data for usage preview
      {
        key: 'meter_id',
        label: 'Meter',
        render: (v) => <span>{v}</span>,
      },
      {
        key: 'total_units',
        label: 'Units',
        render: (v) => <span>{v}</span>,
      },
      {
        key: 'total_revenue',
        label: 'Revenue',
        render: (v) => (
          <span>{formatCurrency(v, { currency: 'KES', locale: 'en-KE' })}</span>
        ),
      },
    ],
    tamperEvents: [
      {
        key: 'meter_id',
        label: 'Meter',
        render: (v) => <span>{v}</span>,
      },
      {
        key: 'event_type',
        label: 'Event',
        render: (v) => <span>{v}</span>,
      },
      {
        key: 'occurred_at',
        label: 'When',
        render: (v) => (
          <span className="text-xs text-slate-500">{formatDateTime(v)}</span>
        ),
      },
    ],
  }

  const columns = columnsByTab[activeTab] || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
        <p className="mt-1 text-slate-600">
          Export detailed reports for transactions, tokens, meter usage, and tamper events.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {REPORT_TABS.map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key)
                setPreviewRows([])
              }}
              className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition ${
                isActive
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Filters + Actions */}
      <Card className="space-y-4">
        {error && (
          <Alert
            type="error"
            title="Error"
            message={error}
            onClose={() => setError(null)}
          />
        )}

        <div className="grid gap-4 lg:grid-cols-4">
          {/* Period */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-3">
            <div>
              <p className="mb-1 text-xs font-semibold text-slate-600">
                From
              </p>
              <Input
                type="date"
                value={filters.date_from}
                onChange={(e) => updateFilter('date_from', e.target.value)}
              />
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-slate-600">
                To
              </p>
              <Input
                type="date"
                value={filters.date_to}
                onChange={(e) => updateFilter('date_to', e.target.value)}
              />
            </div>
          </div>

          {/* Customer */}
          <div>
            <p className="mb-1 text-xs font-semibold text-slate-600">
              Customer
            </p>
            <select
              value={filters.customer_id}
              onChange={(e) => updateFilter('customer_id', e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Customers</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.customer_id})
                </option>
              ))}
            </select>
          </div>

          {/* Meter */}
          <div>
            <p className="mb-1 text-xs font-semibold text-slate-600">
              Meter
            </p>
            <select
              value={filters.meter_id}
              onChange={(e) => updateFilter('meter_id', e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Meters</option>
              {meters.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.meter_id} – {m.location}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Extra filters by tab */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Status */}
          <div>
            <p className="mb-1 text-xs font-semibold text-slate-600">
              Status
            </p>
            <select
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All</option>
              {activeTab === 'transactions' && (
                <>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </>
              )}
              {activeTab === 'tokens' && (
                <>
                  <option value="created">Created</option>
                  <option value="delivered">Delivered</option>
                  <option value="redeemed">Redeemed</option>
                  <option value="expired">Expired</option>
                  <option value="failed">Failed</option>
                </>
              )}
              {activeTab === 'tamperEvents' && (
                <>
                  <option value="open">Open</option>
                  <option value="resolved">Resolved</option>
                </>
              )}
            </select>
          </div>

          {/* Amount range (transactions / tokens) */}
          {(activeTab === 'transactions' || activeTab === 'tokens') && (
            <>
              <div>
                <p className="mb-1 text-xs font-semibold text-slate-600">
                  Min Amount (KES)
                </p>
                <Input
                  type="number"
                  value={filters.min_amount}
                  onChange={(e) => updateFilter('min_amount', e.target.value)}
                />
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold text-slate-600">
                  Max Amount (KES)
                </p>
                <Input
                  type="number"
                  value={filters.max_amount}
                  onChange={(e) => updateFilter('max_amount', e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Filter className="h-4 w-4" />
            <span>
              Adjust filters then preview or export as Excel/CSV via the button.
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2"
              onClick={handlePreview}
              isLoading={previewLoading}
            >
              <RefreshCcw className="h-4 w-4" />
              Preview
            </Button>
            <Button
              type="button"
              className="flex items-center gap-2"
              onClick={handleExport}
              isLoading={exportLoading}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Preview table (if data available for that tab) */}
      {(activeTab === 'transactions' || activeTab === 'tokens') && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {activeTab === 'transactions'
                ? 'Transactions Preview'
                : 'Tokens Preview'}
            </h2>
            <p className="text-xs text-slate-500">
              Showing latest items matching filters (not the full export).
            </p>
          </div>
          <Table
            columns={columns}
            data={previewRows}
            loading={previewLoading}
          />
          {!previewLoading && previewRows.length === 0 && (
            <p className="py-4 text-center text-sm text-slate-500">
              No preview data. Try changing the filters then click “Preview”.
            </p>
          )}
        </Card>
      )}
    </div>
  )
}

export default ReportsPage
