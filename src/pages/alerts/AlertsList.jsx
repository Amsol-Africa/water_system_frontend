// ============================================
// FILE: src/pages/alerts/AlertsList.jsx
// ============================================
import React, { useEffect, useState, useCallback } from 'react'
import { useAlertStore } from '@/store'
import Card from '@/components/common/Card'
import Table from '@/components/common/Table'
import Badge from '@/components/common/Badge'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Alert from '@/components/common/Alert'
import { Search, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { formatDateTime, getStatusColor } from '@/utils/formatters'

const AlertsList = () => {
  const {
    alerts,
    selectedAlert,
    isLoading,
    error,
    fetchAlerts,
    getAlert,
    resolveAlert,
    clearError,
  } = useAlertStore()

  const [severityFilter, setSeverityFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  const load = useCallback(
    (extra = {}) => {
      fetchAlerts({
        severity: severityFilter || undefined,
        status: statusFilter || undefined,
        search: search || undefined,
        ...extra,
      })
    },
    [fetchAlerts, severityFilter, statusFilter, search],
  )

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [severityFilter, statusFilter])

  const handleRowClick = (row) => {
    getAlert(row.id)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    load({ page: 1 })
  }

  const handleResolve = async () => {
    if (!selectedAlert) return
    await resolveAlert(selectedAlert.id)
  }

  const columns = [
    {
      key: 'severity',
      label: '',
      width: '40px',
      render: (value) => {
        const colorClass =
          value === 'critical'
            ? 'text-red-600'
            : value === 'warning'
            ? 'text-amber-500'
            : 'text-blue-500'
        return (
          <div className="flex items-center justify-center">
            <AlertTriangle className={`w-4 h-4 ${colorClass}`} />
          </div>
        )
      },
    },
    {
      key: 'title',
      label: 'Alert',
      render: (value, row) => (
        <div>
          <p className="text-sm font-medium text-slate-900">{value}</p>
          <p className="text-xs text-slate-500 line-clamp-1">{row.message}</p>
        </div>
      ),
    },
    {
      key: 'severity',
      label: 'Severity',
      render: (value) => {
        const badgeClass =
          value === 'critical'
            ? 'bg-red-100 text-red-800 border-red-300'
            : value === 'warning'
            ? 'bg-amber-100 text-amber-800 border-amber-300'
            : 'bg-blue-100 text-blue-800 border-blue-300'
        return <Badge className={badgeClass}>{value}</Badge>
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <Badge className={getStatusColor(value, 'alert')}>{value}</Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value) => (
        <span className="text-xs text-slate-500">{formatDateTime(value)}</span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Alerts</h1>
          <p className="mt-1 text-slate-600">
            System and vending-related alerts (meters, tokens, payments)
          </p>
        </div>
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

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex w-full max-w-md gap-2"
          >
            <Input
              placeholder="Search alerts by title, message, meter, or customer..."
              icon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>

          {/* Severity + Status */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 md:w-44"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 md:w-44"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Layout: table + detail panel */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Table */}
        <div className="xl:col-span-2">
          <Card>
            <Table
              columns={columns}
              data={alerts}
              loading={isLoading}
              onRowClick={handleRowClick}
            />
            {!isLoading && alerts.length === 0 && !error && (
              <p className="py-6 text-center text-sm text-slate-500">
                No alerts for the current filters.
              </p>
            )}
          </Card>
        </div>

        {/* Detail panel */}
        <div className="xl:col-span-1">
          <Card>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Alert Details
            </h2>
            {!selectedAlert ? (
              <p className="text-sm text-slate-500">
                Select an alert to view full details.
              </p>
            ) : (
              <div className="space-y-4 text-sm">
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">
                    Title
                  </p>
                  <p className="font-medium text-slate-900">
                    {selectedAlert.title}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Severity
                    </p>
                    <div className="mt-1">
                      <Badge
                        className={
                          selectedAlert.severity === 'critical'
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : selectedAlert.severity === 'warning'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-blue-100 text-blue-800 border-blue-300'
                        }
                      >
                        {selectedAlert.severity}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Status
                    </p>
                    <div className="mt-1">
                      <Badge
                        className={getStatusColor(
                          selectedAlert.status,
                          'alert',
                        )}
                      >
                        {selectedAlert.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">
                    Message
                  </p>
                  <p className="whitespace-pre-wrap text-slate-800">
                    {selectedAlert.message}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Created At
                    </p>
                    <p>{formatDateTime(selectedAlert.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Resolved At
                    </p>
                    <p>
                      {selectedAlert.resolved_at
                        ? formatDateTime(selectedAlert.resolved_at)
                        : '-'}
                    </p>
                  </div>
                </div>

                {selectedAlert.object_type && selectedAlert.object_id && (
                  <div>
                    <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">
                      Related Object
                    </p>
                    <p className="text-slate-800">
                      {selectedAlert.object_type} –{' '}
                      <span className="font-mono text-xs">
                        {selectedAlert.object_id}
                      </span>
                    </p>
                  </div>
                )}

                {selectedAlert.metadata && (
                  <div>
                    <p className="mb-1 text-xs uppercase tracking-wide text-slate-500">
                      Metadata
                    </p>
                    <pre className="max-h-48 overflow-auto rounded-lg bg-slate-50 p-2 text-xs text-slate-700">
                      {JSON.stringify(selectedAlert.metadata, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedAlert.status !== 'resolved' && (
                  <div className="pt-2">
                    <Button
                      type="button"
                      onClick={handleResolve}
                      className="inline-flex items-center gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Mark as Resolved
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

export default AlertsList
