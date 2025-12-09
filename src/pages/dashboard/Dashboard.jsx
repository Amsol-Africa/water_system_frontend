// ============================================
// FILE 5: src/pages/dashboard/Dashboard.jsx (UPDATED)
// ============================================
import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Alert from '@/components/common/Alert'
import { dashboardService } from '@/services'
import {
  Gauge,
  Users,
  Ticket,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Activity,
  Clock,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { formatDateTime, formatCurrency } from '@/utils/formatters'

const PERIOD_OPTIONS = [
  { value: 'week', label: 'Last 7 days' },
  { value: 'month', label: 'Last 30 days' },
  { value: 'quarter', label: 'Last 90 days' },
  { value: 'year', label: 'This year' },
]

// Colors for meter status pie; tweak as you like
const STATUS_COLORS = {
  active: '#22c55e',
  fault: '#ef4444',
  tamper: '#f97316',
  offline: '#6b7280',
  suspended: '#0ea5e9',
  maintenance: '#8b5cf6',
  unknown: '#9ca3af',
}

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [stats, setStats] = useState(null)
  const [charts, setCharts] = useState({
    tokens_over_time: [],
    revenue_over_time: [],
    meter_status_distribution: [],
  })
  const [activities, setActivities] = useState([])

  const [period, setPeriod] = useState('week')

  const [loadingStats, setLoadingStats] = useState(false)
  const [loadingCharts, setLoadingCharts] = useState(false)
  const [loadingActivity, setLoadingActivity] = useState(false)

  const [error, setError] = useState(null)

  const loadStats = useCallback(async () => {
    setLoadingStats(true)
    setError(null)
    try {
      const res = await dashboardService.getStats()
      setStats(res.data)
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        'Failed to load dashboard stats'
      setError(msg)
    } finally {
      setLoadingStats(false)
    }
  }, [])

  const loadCharts = useCallback(async () => {
    setLoadingCharts(true)
    setError(null)
    try {
      const res = await dashboardService.getCharts({ period })
      setCharts(res.data)
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        'Failed to load charts data'
      setError(msg)
    } finally {
      setLoadingCharts(false)
    }
  }, [period])

  const loadActivity = useCallback(async () => {
    setLoadingActivity(true)
    setError(null)
    try {
      const res = await dashboardService.getRecentActivity()
      setActivities(res.data || [])
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        'Failed to load recent activity'
      setError(msg)
    } finally {
      setLoadingActivity(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
    loadCharts()
    loadActivity()
  }, [loadStats, loadCharts, loadActivity])

  const handlePeriodChange = (e) => {
    setPeriod(e.target.value)
  }

  const handleRefresh = () => {
    loadStats()
    loadCharts()
    loadActivity()
  }

  // Derived values with safe fallbacks
  const activeMeters = stats?.active_meters ?? 0
  const totalMeters = stats?.total_meters ?? 0
  const totalCustomers = stats?.total_customers ?? 0
  const tokens7d = stats?.tokens_issued_7d ?? 0
  const revenue7d = stats?.revenue_7d ?? 0
  const pendingPayments = stats?.pending_payments ?? 0
  const failedPayments = stats?.failed_payments ?? 0

  const tokensChart = charts.tokens_over_time || []
  const revenueChart = charts.revenue_over_time || []
  const meterStatusChart = charts.meter_status_distribution || []

  const combinedTokensRevenue = tokensChart.map((t) => {
    const revenueEntry = revenueChart.find((r) => r.date === t.date)
    return {
      date: t.date,
      tokens: t.tokens,
      amount: Number(t.amount || 0),
      revenue: Number(revenueEntry?.revenue || 0),
    }
  })

  const meterStatusWithLabels = meterStatusChart.map((m) => ({
    ...m,
    label: (m.status || 'unknown')
      .replace('_', ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()),
  }))

  const isLoading = loadingStats || loadingCharts || loadingActivity

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">
            Welcome back, {user?.first_name || user?.email || 'User'}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={handlePeriodChange}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {PERIOD_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Global error */}
      {error && (
        <Alert
          type="error"
          title="Dashboard error"
          message={error}
        />
      )}

      {/* Top stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Active Meters</p>
              <p className="text-2xl font-bold text-slate-900">
                {activeMeters}/{totalMeters}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {totalMeters > 0
                  ? `${Math.round((activeMeters / totalMeters) * 100)}% online`
                  : 'No meters registered'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <Gauge className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Customers</p>
              <p className="text-2xl font-bold text-slate-900">
                {totalCustomers}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Linked to your meters & payments
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Tokens (last 7 days)</p>
              <p className="text-2xl font-bold text-slate-900">
                {tokens7d}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Auto + manual vending activity
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
              <Ticket className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Revenue (last 7 days)</p>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(revenue7d, { currency: 'KES', locale: 'en-KE' })}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Verified M-Pesa payments
              </p>
            </div>
            <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary stats row (health overview) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
            Meter health
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">
                Fault / Tamper / Offline
              </p>
              <p className="mt-1 text-sm text-slate-700">
                Fault: <span className="font-semibold">{stats?.fault_meters ?? 0}</span> ·{' '}
                Tamper: <span className="font-semibold">{stats?.tamper_meters ?? 0}</span> ·{' '}
                Offline: <span className="font-semibold">{stats?.offline_meters ?? 0}</span>
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-50 text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="mt-3 px-0 text-xs text-primary-600 inline-flex items-center"
            onClick={() => navigate('/meters')}
          >
            View meters
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
            Payments health
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Pending / Failed payments</p>
              <p className="mt-1 text-sm text-slate-700">
                Pending: <span className="font-semibold">{pendingPayments}</span> ·{' '}
                Failed: <span className="font-semibold text-red-600">{failedPayments}</span>
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-100 text-slate-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="mt-3 px-0 text-xs text-primary-600 inline-flex items-center"
            onClick={() => navigate('/payments')}
          >
            View payments
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
            Tokens
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">
                Total tokens issued
              </p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {stats?.tokens_issued ?? 0}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Includes vending, clear credit & tamper
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
              <Ticket className="w-6 h-6" />
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="mt-3 px-0 text-xs text-primary-600 inline-flex items-center"
            onClick={() => navigate('/tokens')}
          >
            View tokens
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Card>
      </div>

      {/* Charts + meter distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tokens & revenue over time */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Tokens & Revenue over time
            </h2>
            <span className="text-xs text-slate-500">
              Based on verified payments & token issuance
            </span>
          </div>
          <div className="h-64">
            {combinedTokensRevenue.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-slate-500">
                No data for the selected period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedTokensRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="tokens"
                    name="Tokens"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue (KES)"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Meter status distribution */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Meter status distribution
            </h2>
          </div>
          <div className="h-64 flex">
            {meterStatusWithLabels.length === 0 ? (
              <div className="m-auto text-sm text-slate-500">
                No meter status data.
              </div>
            ) : (
              <>
                <div className="w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={meterStatusWithLabels}
                        dataKey="count"
                        nameKey="label"
                        outerRadius={80}
                        fill="#8884d8"
                        labelLine={false}
                      >
                        {meterStatusWithLabels.map((entry, index) => {
                          const color =
                            STATUS_COLORS[entry.status] ||
                            STATUS_COLORS.unknown
                          return (
                            <Cell key={index} fill={color} />
                          )
                        })}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 pl-4 flex flex-col justify-center gap-2">
                  {meterStatusWithLabels.map((entry) => (
                    <div
                      key={entry.status}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block w-2 h-2 rounded-full"
                          style={{
                            backgroundColor:
                              STATUS_COLORS[entry.status] ||
                              STATUS_COLORS.unknown,
                          }}
                        />
                        <span>{entry.label}</span>
                      </div>
                      <span className="font-semibold">{entry.count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent activity
          </h2>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => navigate('/payments')}
            >
              Payments
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => navigate('/tokens')}
            >
              Tokens
            </Button>
          </div>
        </div>

        {loadingActivity ? (
          <div className="py-8 text-center text-sm text-slate-500">
            Loading activity...
          </div>
        ) : activities.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">
            No recent activity to display.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {activities.map((item) => (
              <li
                key={`${item.type}-${item.id}`}
                className="py-3 flex items-start gap-3"
              >
                <div
                  className={`mt-1 p-2 rounded-full ${
                    item.type === 'payment'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-indigo-50 text-indigo-600'
                  }`}
                >
                  {item.type === 'payment' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <Ticket className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {item.title}
                    </p>
                    {item.timestamp && (
                      <p className="text-xs text-slate-500 shrink-0">
                        {formatDateTime(item.timestamp)}
                      </p>
                    )}
                  </div>
                  {item.subtitle && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.subtitle}
                    </p>
                  )}
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                    {item.customer_name && (
                      <span>Customer: {item.customer_name}</span>
                    )}
                    {item.meter_id && (
                      <span>Meter: {item.meter_id}</span>
                    )}
                    {item.status && (
                      <span>Status: {item.status}</span>
                    )}
                  </div>

                  <div className="mt-1 flex flex-wrap gap-2 text-xs">
                    {item.links?.payment && (
                      <button
                        type="button"
                        className="text-primary-600 hover:text-primary-700 inline-flex items-center"
                        onClick={() =>
                          navigate(`/payments?tx=${item.links.payment}`)
                        }
                      >
                        View payment
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </button>
                    )}
                    {item.links?.tokens_for_payment && (
                      <button
                        type="button"
                        className="text-primary-600 hover:text-primary-700 inline-flex items-center"
                        onClick={() =>
                          navigate(
                            `/tokens?payment=${item.links.tokens_for_payment}`,
                          )
                        }
                      >
                        View tokens
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </button>
                    )}
                    {item.links?.token && (
                      <button
                        type="button"
                        className="text-primary-600 hover:text-primary-700 inline-flex items-center"
                        onClick={() => navigate(`/tokens?token=${item.links.token}`)}
                      >
                        Open token
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

export default Dashboard
