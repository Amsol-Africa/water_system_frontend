import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTokenStore } from '@/store'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Table from '@/components/common/Table'
import Badge from '@/components/common/Badge'
import Input from '@/components/common/Input'
import Alert from '@/components/common/Alert'
import { Plus, Search, XCircle, Download, RefreshCw } from 'lucide-react'
import {
  formatDateTime,
  formatCurrency,
  formatTokenStatus,
  getStatusColor,
  formatPhone,
  mask,
} from '@/utils/formatters'
import { usePagination } from '@/hooks/usePagination'

const TokensList = () => {
  const navigate = useNavigate()
  const { tokens, isLoading, fetchTokens, resendSms } = useTokenStore()
  const [searchParams] = useSearchParams()

  // Filters
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [customerFilter, setCustomerFilter] = useState('')
  const [meterFilter, setMeterFilter] = useState('')
  const [tokenType, setTokenType] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [error, setError] = useState(null)
  const [selectedToken, setSelectedToken] = useState(null)
  const [resendStatus, setResendStatus] = useState(null)

  // From Payments page: ?tx=<mpesa_transaction_id>
  const txFilter = searchParams.get('tx') || null

  const loadTokens = useCallback(
    async (overrides = {}) => {
      setError(null)
      const params = {
        status: status || undefined,
        // If txFilter is present, it overrides search
        search: txFilter || search || undefined,
        token_type: tokenType || undefined,
        ...overrides,
      }
      try {
        await fetchTokens(params)
      } catch (err) {
        const msg =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          'Failed to load tokens'
        setError(msg)
      }
    },
    [fetchTokens, status, search, tokenType, txFilter],
  )

  useEffect(() => {
    loadTokens()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadTokens])

  const handleStatusChange = (e) => setStatus(e.target.value)
  const handleSearchChange = (e) => setSearch(e.target.value)
  const handleCustomerFilterChange = (e) => setCustomerFilter(e.target.value)
  const handleMeterFilterChange = (e) => setMeterFilter(e.target.value)
  const handleTokenTypeChange = (e) => setTokenType(e.target.value)
  const handleDateFromChange = (e) => setDateFrom(e.target.value)
  const handleDateToChange = (e) => setDateTo(e.target.value)

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    loadTokens()
  }

  const handleClearTxFilter = () => {
    navigate('/tokens') // remove ?tx=...
  }

  const handleRowClick = (token) => {
    setSelectedToken(token)
  }

  // ---- CLIENT-SIDE FILTERING 
  const filteredTokens = useMemo(() => {
    const customerQ = customerFilter.toLowerCase()
    const meterQ = meterFilter.toLowerCase()

    return (tokens || []).filter((token) => {
      // Status (already in params, but keep client-side in case)
      if (status && token.status !== status) return false

      // Token type
      if (tokenType && token.token_type !== tokenType) return false

      // Customer: match name or phone
      if (customerQ) {
        const name = (token.customer_name || '').toLowerCase()
        const phone = (token.customer_phone || '').toLowerCase()
        if (!name.includes(customerQ) && !phone.includes(customerQ)) return false
      }

      // Meter: match meter_id
      if (meterQ) {
        const mid = (token.meter_id || '').toLowerCase()
        if (!mid.includes(meterQ)) return false
      }

      // Period filter on created_at
      if (dateFrom) {
        const created = new Date(token.created_at)
        const from = new Date(dateFrom + 'T00:00:00')
        if (created < from) return false
      }
      if (dateTo) {
        const created = new Date(token.created_at)
        const to = new Date(dateTo + 'T23:59:59')
        if (created > to) return false
      }

      return true
    })
  }, [tokens, status, tokenType, customerFilter, meterFilter, dateFrom, dateTo])

  // ---- PAGINATION (client-side) ----
  const {
    currentPage,
    totalPages,
    currentItems: pagedTokens,
    nextPage,
    prevPage,
    goToPage,
  } = usePagination(filteredTokens, 10) // 10 rows per page

  const handlePagePrev = () => prevPage()
  const handlePageNext = () => nextPage()

  // ---- BULK EXPORT CSV (exports all filteredTokens) ----
  const handleExportCsv = () => {
    if (!filteredTokens.length) {
      alert('No tokens to export for current filters.')
      return
    }

    const headers = [
      'Token',
      'Meter',
      'Customer',
      'Customer Phone',
      'Amount',
      'Units',
      'Status',
      'Token Type',
      'Created At',
      'Delivered At',
      'Expires At',
      'Payment Tx',
    ]

    const rows = filteredTokens.map((t) => [
      t.token_value || '',
      t.meter_id || '',
      t.customer_name || '',
      t.customer_phone || '',
      t.amount != null ? String(t.amount) : '',
      t.units != null ? String(t.units) : '',
      t.status || '',
      t.token_type || '',
      t.created_at || '',
      t.delivered_at || '',
      t.expires_at || '',
      t.payment_transaction_id || '',
    ])

    const csvLines = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((value) => {
            const v = String(value ?? '')
            // Escape double-quotes
            const escaped = v.replace(/"/g, '""')
            return `"${escaped}"`
          })
          .join(','),
      ),
    ]

    const blob = new Blob([csvLines.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute(
      'download',
      `tokens_${new Date().toISOString().slice(0, 10)}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // ---- Resend SMS 
  const handleResendSms = async () => {
    if (!selectedToken?.id) {
      setResendStatus({
        type: 'error',
        message: 'No token selected to resend SMS.',
      })
      return
    }

    setResendStatus(null)
    const res = await resendSms(selectedToken.id)

    if (res.success) {
      // update selectedToken from returned data if present
      if (res.data?.token) {
        setSelectedToken(res.data.token)
      }
      setResendStatus({
        type: 'success',
        message: res.data?.message || 'SMS resent successfully.',
      })
    } else {
      setResendStatus({
        type: 'error',
        message: res.error || 'Failed to resend SMS.',
      })
    }
  }

  const columns = [
    {
      key: 'token_value',
      label: 'Token',
      render: (value) =>
        value ? (
          <span className="font-mono text-xs md:text-sm font-medium">
            {mask(String(value), 4)}
          </span>
        ) : (
          <span className="text-slate-500 text-xs">N/A</span>
        ),
    },
    {
      key: 'meter_id',
      label: 'Meter',
      render: (value) => <span className="text-sm">{value}</span>,
    },
    {
      key: 'customer_name',
      label: 'Customer',
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="text-sm">{value || '-'}</span>
          {row.customer_phone && (
            <span className="text-xs text-slate-500">
              {formatPhone(row.customer_phone)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Value',
      render: (_value, row) => {
        const isUnits = row.is_vend_by_unit
        if (isUnits && row.units != null) {
          return (
            <span className="text-sm font-medium">
              {row.units}{' '}
              <span className="text-slate-500">units</span>
            </span>
          )
        }
        if (row.amount != null) {
          return (
            <span className="text-sm font-medium">
              {formatCurrency(row.amount, {
                currency: 'KES',
                locale: 'en-KE',
              })}
            </span>
          )
        }
        return <span className="text-slate-500 text-sm">-</span>
      },
    },
    {
      key: 'units',
      label: 'Units',
      render: (_value, row) => (
        <span className="text-sm">
          {row.units != null ? row.units : '-'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Badge className={getStatusColor(value, 'token')}>
          {formatTokenStatus(value)}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value) => (
        <span className="text-xs text-slate-500">
          {formatDateTime(value)}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tokens</h1>
          <p className="text-slate-600 mt-1">
            Manage vending, clear credit, and clear tamper tokens
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex items-center"
            onClick={handleExportCsv}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={() => navigate('/tokens/issue')}
            className="flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Issue Token
          </Button>
        </div>
      </div>

      {/* Filters & alerts */}
      <Card className="space-y-4">
        {error && (
          <Alert
            type="error"
            title="Error loading tokens"
            message={error}
          />
        )}

        {txFilter && (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-primary-200 bg-primary-50 px-3 py-2">
            <div className="text-xs md:text-sm">
              <span className="font-semibold text-primary-700">
                Filtered by Payment Tx:
              </span>{' '}
              <span className="font-mono text-[11px] md:text-xs break-all">
                {txFilter}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearTxFilter}
              className="inline-flex items-center gap-1 text-xs"
            >
              <XCircle className="w-4 h-4" />
              Clear
            </Button>
          </div>
        )}

        {/* Row 1: search + status + token type */}
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          {/* Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="w-full md:max-w-md flex gap-2"
          >
            <Input
              placeholder="Search by token, meter, customer, or payment Tx..."
              icon={<Search className="w-4 h-4" />}
              value={search}
              onChange={handleSearchChange}
            />
            <Button
              type="submit"
              variant="primary"
              className="hidden md:inline-flex"
            >
              Search
            </Button>
          </form>

          <div className="flex flex-wrap gap-3 items-center justify-end">
            {/* Status filter */}
            <div className="flex gap-2 items-center">
              <span className="text-sm text-slate-600">Status:</span>
              <select
                value={status}
                onChange={handleStatusChange}
                className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              >
                <option value="">All</option>
                <option value="created">Created</option>
                <option value="delivered">Delivered</option>
                <option value="redeemed">Redeemed</option>
                <option value="expired">Expired</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Token type filter */}
            <div className="flex gap-2 items-center">
              <span className="text-sm text-slate-600">Type:</span>
              <select
                value={tokenType}
                onChange={handleTokenTypeChange}
                className="w-36 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              >
                <option value="">All</option>
                <option value="vending">Vending</option>
                <option value="clear_credit">Clear Credit</option>
                <option value="clear_tamper">Clear Tamper</option>
              </select>
            </div>
          </div>
        </div>

        {/* Row 2: period + customer + meter filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="flex flex-col">
            <label className="text-xs text-slate-500 mb-1">From date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={handleDateFromChange}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-slate-500 mb-1">To date</label>
            <input
              type="date"
              value={dateTo}
              onChange={handleDateToChange}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-slate-500 mb-1">
              Customer (name / phone)
            </label>
            <input
              type="text"
              value={customerFilter}
              onChange={handleCustomerFilterChange}
              placeholder="e.g. Jane or 07..."
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-slate-500 mb-1">Meter ID</label>
            <input
              type="text"
              value={meterFilter}
              onChange={handleMeterFilterChange}
              placeholder="e.g. 581000..."
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </Card>

      {/* Layout: table + detail */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Table */}
        <div className="xl:col-span-2">
          <Card>
            <Table
              columns={columns}
              data={pagedTokens}
              loading={isLoading}
              onRowClick={handleRowClick}
            />
            {!isLoading && filteredTokens.length === 0 && !error && (
              <p className="text-center text-sm text-slate-500 py-6">
                No tokens found for the current filters.
              </p>
            )}

            {/* Pagination footer */}
            {filteredTokens.length > 0 && (
              <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-4 text-sm text-slate-600">
                <div>
                  <span>
                    Showing{' '}
                    <span className="font-medium">
                      {filteredTokens.length
                        ? (currentPage - 1) * 10 + 1
                        : 0}
                      -
                      {Math.min(currentPage * 10, filteredTokens.length)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">
                      {filteredTokens.length}
                    </span>{' '}
                    tokens
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePagePrev}
                    disabled={currentPage <= 1}
                    className={`px-3 py-1 rounded-md border text-sm ${
                      currentPage <= 1
                        ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Previous
                  </button>
                  <span>
                    Page{' '}
                    <span className="font-semibold">{currentPage}</span> of{' '}
                    <span className="font-semibold">{totalPages}</span>
                  </span>
                  <button
                    onClick={handlePageNext}
                    disabled={currentPage >= totalPages}
                    className={`px-3 py-1 rounded-md border text-sm ${
                      currentPage >= totalPages
                        ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Detail panel */}
        <div className="xl:col-span-1">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Token Details
              </h2>
              {selectedToken && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="inline-flex items-center gap-1 text-xs"
                  onClick={handleResendSms}
                  disabled={!selectedToken.customer_phone || isLoading}
                >
                  <RefreshCw className="w-4 h-4" />
                  Resend SMS
                </Button>
              )}
            </div>

            {/* Show resend result feedback */}
            {resendStatus && (
              <Alert
                type={resendStatus.type}
                message={resendStatus.message}
                onClose={() => setResendStatus(null)}
                className="mb-3"
              />
            )}

            {!selectedToken ? (
              <p className="text-sm text-slate-500">
                Select a token from the table to view more details.
              </p>
            ) : (
              <div className="space-y-5 text-sm">
                {/* Token value */}
                <div>
                  <p className="text-slate-500 mb-1">Token Value</p>
                  <p className="font-mono break-all text-xs md:text-sm">
                    {selectedToken.token_value}
                  </p>
                </div>

                {/* Meter & customer */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-500">Meter</p>
                    <p className="font-medium">
                      {selectedToken.meter_id || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Customer</p>
                    <p className="font-medium">
                      {selectedToken.customer_name || '-'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {selectedToken.customer_phone
                        ? formatPhone(selectedToken.customer_phone)
                        : ''}
                    </p>
                  </div>
                </div>

                {/* Vend mode & status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-500">Vend Type</p>
                    <p className="font-medium">
                      {selectedToken.is_vend_by_unit
                        ? 'Vend by Units'
                        : 'Vend by Amount'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {selectedToken.token_type === 'clear_credit'
                        ? 'Clear Credit Token'
                        : selectedToken.token_type === 'clear_tamper'
                        ? 'Clear Tamper Token'
                        : 'Standard Vending Token'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Status</p>
                    <Badge
                      className={`${getStatusColor(
                        selectedToken.status,
                        'token',
                      )} mt-1`}
                    >
                      {formatTokenStatus(selectedToken.status)}
                    </Badge>
                  </div>
                </div>

                {/* Amount & units */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-500">Amount (KES)</p>
                    <p className="font-medium">
                      {selectedToken.amount != null
                        ? formatCurrency(selectedToken.amount, {
                            currency: 'KES',
                            locale: 'en-KE',
                          })
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Units</p>
                    <p className="font-medium">
                      {selectedToken.units != null
                        ? selectedToken.units
                        : '-'}
                    </p>
                  </div>
                </div>

                {/* Issued by & timestamps */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-500 mb-1">Issued By</p>
                    {selectedToken.issued_by_name ||
                    selectedToken.issued_by_email ? (
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary-100 flex items-center justify-center text-[11px] font-semibold text-primary-700">
                          {(selectedToken.issued_by_name ||
                            selectedToken.issued_by_email ||
                            'U')[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {selectedToken.issued_by_name ||
                              selectedToken.issued_by_email}
                          </p>
                          {selectedToken.issued_by_role && (
                            <p className="text-xs text-slate-500 capitalize">
                              {selectedToken.issued_by_role.replace('_', ' ')}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-700">
                        System (M-Pesa)
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-slate-500">Created At</p>
                    <p>{formatDateTime(selectedToken.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Delivered At</p>
                    <p>
                      {selectedToken.delivered_at
                        ? formatDateTime(selectedToken.delivered_at)
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Expires At</p>
                    <p>
                      {selectedToken.expires_at
                        ? formatDateTime(selectedToken.expires_at)
                        : '-'}
                    </p>
                  </div>
                </div>

                {/* Payment link */}
                {selectedToken.payment_transaction_id && (
                  <div>
                    <p className="text-slate-500 mb-1">Linked Payment</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() =>
                        navigate(
                          `/payments?tx=${selectedToken.payment_transaction_id}`,
                        )
                      }
                    >
                      View Payment (
                      {mask(selectedToken.payment_transaction_id, 4)})
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default TokensList
