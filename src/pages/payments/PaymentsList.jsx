// src/pages/payments/PaymentsList.jsx
import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Card from '@/components/common/Card'
import Table from '@/components/common/Table'
import Badge from '@/components/common/Badge'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Alert from '@/components/common/Alert'
import { paymentService } from '@/services'
import {
  formatDateTime,
  formatCurrency,
  formatPaymentStatus,
  getStatusColor,
  formatPhone,
  mask,
} from '@/utils/formatters'
import {
  Search,
  RefreshCcw,
  RotateCw,
  ArrowRightCircle,
  ExternalLink,
  Clipboard,
} from 'lucide-react'

const QUICK_STATUSES = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
]

const PaymentsList = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [payments, setPayments] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [selectedPayment, setSelectedPayment] = useState(null)

  const [isRetrying, setIsRetrying] = useState(false)
  const [retryMessage, setRetryMessage] = useState(null)

  const [isReconciling, setIsReconciling] = useState(false)
  const [reconcileMessage, setReconcileMessage] = useState(null)

  const [copied, setCopied] = useState(false)

  // Optional initial filter from URL: ?tx=<mpesa_transaction_id>
  const initialTxId = searchParams.get('tx')

  // ------------------------------------------------------------------
  // Load payments
  // ------------------------------------------------------------------
  const loadPayments = useCallback(
    async (overrides = {}) => {
      setIsLoading(true)
      setError(null)

      const params = {
        status: status || undefined,
        // if URL has tx, that wins; otherwise use free-text search
        search: initialTxId || search || undefined,
        ...overrides,
      }

      try {
        const res = await paymentService.list(params)
        const data = Array.isArray(res.data) ? res.data : res.data.results || []
        setPayments(data)

        if (!selectedPayment && data.length > 0) {
          setSelectedPayment(data[0])
        }
      } catch (err) {
        const msg =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          'Failed to load payments'
        setError(msg)
      } finally {
        setIsLoading(false)
      }
    },
    [status, search, initialTxId, selectedPayment],
  )

  useEffect(() => {
    loadPayments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadPayments])

  // ------------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------------
  const handleStatusChange = (e) => {
    setStatus(e.target.value)
  }

  const handleQuickStatus = (value) => {
    setStatus(value)
  }

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    loadPayments()
  }

  const handleRefresh = () => {
    loadPayments()
  }

  const handleRowClick = (payment) => {
    setSelectedPayment(payment)
    setRetryMessage(null)
  }

  const doRetry = async (payment) => {
    if (!payment) return
    setIsRetrying(true)
    setRetryMessage(null)

    try {
      const res = await paymentService.retry(payment.id)
      const msg =
        res?.data?.message || 'Payment retry initiated. Vending will be re-attempted.'
      setRetryMessage({ type: 'success', text: msg })
      await loadPayments()
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        'Failed to retry payment'
      setRetryMessage({ type: 'error', text: msg })
    } finally {
      setIsRetrying(false)
    }
  }

  const handleRetry = async () => {
    if (!selectedPayment) return
    await doRetry(selectedPayment)
  }

  const handleInlineRetry = async (payment) => {
    setSelectedPayment(payment)
    await doRetry(payment)
  }

  const handleReconcile = async () => {
    setIsReconciling(true)
    setReconcileMessage(null)
    try {
      const res = await paymentService.reconcile()
      const msg =
        res?.data?.message ||
        'Reconciliation initiated. Records will be updated in background.'
      setReconcileMessage({ type: 'success', text: msg })
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        'Failed to start reconciliation'
      setReconcileMessage({ type: 'error', text: msg })
    } finally {
      setIsReconciling(false)
    }
  }

  const handleViewTokens = () => {
    if (!selectedPayment || !selectedPayment.mpesa_transaction_id) return
    // Filter tokens by M-Pesa transaction id
    navigate(`/tokens?tx=${selectedPayment.mpesa_transaction_id}`)
  }

  const handleViewCustomer = () => {
    if (!selectedPayment || !selectedPayment.customer) return
    navigate(`/customers/${selectedPayment.customer}`)
  }

  const handleViewMeter = () => {
    if (!selectedPayment || !selectedPayment.account_number) return
    // Basic navigation by meter_id; you can later wire a direct detail link
    navigate(`/meters?meter_id=${selectedPayment.account_number}`)
  }

  const handleCopyTxId = async () => {
    if (!selectedPayment?.mpesa_transaction_id) return
    try {
      await navigator.clipboard.writeText(selectedPayment.mpesa_transaction_id)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore clipboard errors
    }
  }

  const filteredPayments = payments 

  // ------------------------------------------------------------------
  // Summary stats
  // ------------------------------------------------------------------
  const totalCount = filteredPayments.length
  const totalAmount = filteredPayments.reduce(
    (sum, p) => sum + (Number(p.amount) || 0),
    0,
  )
  const failedCount = filteredPayments.filter((p) => p.status === 'failed').length
  const verifiedCount = filteredPayments.filter((p) => p.status === 'verified').length

  const canRetry =
    selectedPayment &&
    (selectedPayment.status === 'failed' || selectedPayment.status === 'pending')

  // ------------------------------------------------------------------
  // Table columns
  // ------------------------------------------------------------------
  const columns = [
    {
      key: 'mpesa_transaction_id',
      label: 'Transaction ID',
      render: (value) => (
        <span className="font-mono text-xs md:text-sm">
          {value ? mask(value, 3) : '-'}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value) => (
        <span className="font-medium">
          {formatCurrency(value, { currency: 'KES', locale: 'en-KE' })}
        </span>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value) => <span>{formatPhone(value)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Badge className={getStatusColor(value, 'payment')}>
          {formatPaymentStatus(value)}
        </Badge>
      ),
    },
    {
      key: 'paybill',
      label: 'Paybill',
      render: (value) => <span className="text-sm">{value || '-'}</span>,
    },
    {
      key: 'account_number',
      label: 'Account (Meter)',
      render: (value) => (
        <span className="font-mono text-xs md:text-sm">{value || '-'}</span>
      ),
    },
    {
      key: 'client_name',
      label: 'Client',
      render: (value) => <span className="text-sm">{value || '-'}</span>,
    },
    {
      key: 'customer_name',
      label: 'Customer',
      render: (value) => <span className="text-sm">{value || '-'}</span>,
    },
    {
      key: 'tokens_count',
      label: 'Tokens',
      render: (value) => (
        <span className="text-sm font-medium">{value ?? 0}</span>
      ),
    },
    {
      key: 'received_at',
      label: 'Received',
      render: (value) => (
        <span className="text-xs text-slate-500">
          {formatDateTime(value)}
        </span>
      ),
    },
    {
      key: '__actions',
      label: '',
      render: (_, row) => {
        const canInlineRetry =
          row.status === 'failed' || row.status === 'pending'
        if (!canInlineRetry) return null
        return (
          <Button
            size="xs"
            variant="outline"
            className="text-xs px-2 py-1"
            onClick={(e) => {
              e.stopPropagation()
              handleInlineRetry(row)
            }}
          >
            <RotateCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payments</h1>
          <p className="text-slate-600 mt-1">
            M-Pesa payment transactions, vending status, and notifications
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReconcile}
            isLoading={isReconciling}
            className="inline-flex items-center gap-2"
          >
            <RotateCw className="w-4 h-4" />
            Reconcile
          </Button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="py-3 px-4 flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-slate-500">
            Total payments
          </span>
          <span className="text-xl font-semibold">{totalCount}</span>
        </Card>
        <Card className="py-3 px-4 flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-slate-500">
            Total amount
          </span>
          <span className="text-xl font-semibold">
            {formatCurrency(totalAmount, { currency: 'KES', locale: 'en-KE' })}
          </span>
        </Card>
        <Card className="py-3 px-4 flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-slate-500">
            Verified / Failed
          </span>
          <span className="text-sm font-medium">
            <span className="text-green-700">{verifiedCount} verified</span>
            <span className="mx-2 text-slate-400">·</span>
            <span className="text-red-600">{failedCount} failed</span>
          </span>
        </Card>
      </div>

      {/* Filters + global messages */}
      <Card className="space-y-4">
        {error && (
          <Alert
            type="error"
            title="Error loading payments"
            message={error}
          />
        )}

        {reconcileMessage && (
          <Alert
            type={reconcileMessage.type}
            title={reconcileMessage.type === 'success' ? 'Reconciliation' : 'Reconcile Error'}
            message={reconcileMessage.text}
          />
        )}

        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          {/* Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="w-full md:max-w-md flex gap-2"
          >
            <Input
              placeholder="Search by Tx ID, phone, or account..."
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

          {/* Status filter (dropdown + quick pills) */}
          <div className="flex flex-col gap-2 items-start">
            <div className="flex gap-3 items-center">
              <span className="text-sm text-slate-600">Status:</span>
              <select
                value={status}
                onChange={handleStatusChange}
                className="w-full md:w-48 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_STATUSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => handleQuickStatus(s.value)}
                  className={`px-2.5 py-1 rounded-full border text-xs ${
                    status === s.value
                      ? 'bg-primary-50 border-primary-300 text-primary-700'
                      : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Main layout: table + detail panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Table */}
        <div className="xl:col-span-2">
          <Card>
            <Table
              columns={columns}
              data={filteredPayments}
              loading={isLoading}
              onRowClick={handleRowClick}
            />
            {!isLoading && filteredPayments.length === 0 && !error && (
              <p className="text-center text-sm text-slate-500 py-6">
                No payments found for the current filters.
              </p>
            )}
          </Card>
        </div>

        {/* Detail side panel */}
        <div className="xl:col-span-1">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Payment Details
              </h2>
              {selectedPayment && (
                <span className="text-xs text-slate-500">
                  {formatDateTime(selectedPayment.received_at)}
                </span>
              )}
            </div>

            {!selectedPayment ? (
              <p className="text-sm text-slate-500">
                Select a payment from the table to view details.
              </p>
            ) : (
              <div className="space-y-5 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <p className="text-slate-500">Transaction ID</p>
                    <p className="font-mono break-all text-xs md:text-sm">
                      {selectedPayment.mpesa_transaction_id}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    className="inline-flex items-center gap-1"
                    onClick={handleCopyTxId}
                  >
                    <Clipboard className="w-3 h-3" />
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-500">Amount</p>
                    <p className="font-medium">
                      {formatCurrency(selectedPayment.amount, {
                        currency: 'KES',
                        locale: 'en-KE',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Status</p>
                    <Badge
                      className={`${getStatusColor(
                        selectedPayment.status,
                        'payment',
                      )} mt-1`}
                    >
                      {formatPaymentStatus(selectedPayment.status)}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-500">Phone</p>
                    <p>{formatPhone(selectedPayment.phone)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Paybill</p>
                    <p>{selectedPayment.paybill || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Account (Meter)</p>
                    <p className="font-mono">
                      {selectedPayment.account_number || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Client</p>
                    <p>{selectedPayment.client_name || '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-slate-500">Customer</p>
                    <div className="flex items-center gap-1">
                      <p>{selectedPayment.customer_name || '-'}</p>
                      {selectedPayment.customer && (
                        <button
                          type="button"
                          onClick={handleViewCustomer}
                          className="text-primary-600 hover:text-primary-700 inline-flex items-center text-xs"
                        >
                          <ExternalLink className="w-3 h-3 mr-0.5" />
                          Open
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-500">Tokens issued</p>
                    <p>{selectedPayment.tokens_count ?? 0}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-500">Received at</p>
                    <p>{formatDateTime(selectedPayment.received_at)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Processed at</p>
                    <p>
                      {selectedPayment.processed_at
                        ? formatDateTime(selectedPayment.processed_at)
                        : '-'}
                    </p>
                  </div>
                </div>

                {selectedPayment.error_message && (
                  <div>
                    <p className="text-slate-500 mb-1">Error</p>
                    <p className="text-red-600 whitespace-pre-wrap">
                      {selectedPayment.error_message}
                    </p>
                  </div>
                )}

                {selectedPayment.raw_payload && (
                  <div>
                    <p className="text-slate-500 mb-1">Raw Payload</p>
                    <pre className="bg-slate-950/90 text-slate-100 text-xs rounded-lg p-3 overflow-auto max-h-64">
                      {JSON.stringify(selectedPayment.raw_payload, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Detail actions */}
                <div className="pt-2 space-y-3">
                  {retryMessage && (
                    <Alert
                      type={retryMessage.type}
                      title={
                        retryMessage.type === 'success'
                          ? 'Retry initiated'
                          : 'Retry failed'
                      }
                      message={retryMessage.text}
                    />
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleViewTokens}
                      className="inline-flex items-center gap-2 w-full"
                      disabled={!selectedPayment.mpesa_transaction_id}
                    >
                      <ArrowRightCircle className="w-4 h-4" />
                      View Tokens for this Payment
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleRetry}
                      disabled={!canRetry}
                      isLoading={isRetrying}
                      className="inline-flex items-center gap-2 w-full sm:w-auto"
                    >
                      <RotateCw className="w-4 h-4" />
                      Retry Vending
                    </Button>
                  </div>

                  {!canRetry && (
                    <p className="text-xs text-slate-500">
                      Retry is only available for payments in{' '}
                      <span className="font-semibold">pending</span> or{' '}
                      <span className="font-semibold">failed</span> status.
                    </p>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default PaymentsList
