// ============================================
// FILE 3: src/components/layout/Header.jsx
// ============================================
import React, { useState, useMemo, useEffect } from 'react'
import {
  Menu,
  LogOut,
  Bell,
  ChevronDown,
  User,
  Settings,
  X,
  AlertTriangle,
  Info,
  CheckCircle2,
  Filter,
} from 'lucide-react'
import { useAuth } from '@/hooks'
import { useNavigate } from 'react-router-dom'
import { formatDateTime } from '@/utils/formatters'
import { useAlertStore } from '@/store'

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [alertsOpen, setAlertsOpen] = useState(false)
  const [alertFilter, setAlertFilter] = useState('all')

  const {
    alerts,
    isLoading: alertsLoading,
    fetchAlerts,
  } = useAlertStore()

  useEffect(() => {
    if (alertsOpen) {
      // Load a small page of latest alerts
      fetchAlerts({ page: 1, page_size: 10 })
    }
  }, [alertsOpen, fetchAlerts])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const initials =
    (user?.first_name?.[0] || user?.email?.[0] || 'U').toUpperCase()

  const roleLabel = user?.role
    ? user.role.replace(/_/g, ' ').toLowerCase()
    : 'user'

  const filteredAlerts = useMemo(() => {
    if (alertFilter === 'all') return alerts
    return alerts.filter((a) => a.severity === alertFilter)
  }, [alerts, alertFilter])

  const alertCounts = useMemo(() => {
    return alerts.reduce(
      (acc, a) => {
        acc.total += 1
        acc[a.severity] = (acc[a.severity] || 0) + 1
        return acc
      },
      { total: 0, critical: 0, warning: 0, info: 0 },
    )
  }, [alerts])

  const renderAlertIcon = (severity) => {
    if (severity === 'critical') {
      return <AlertTriangle className="w-4 h-4 text-rose-400" />
    }
    if (severity === 'warning') {
      return <AlertTriangle className="w-4 h-4 text-amber-400" />
    }
    return <Info className="w-4 h-4 text-sky-400" />
  }

  const alertChipClass = (value, type) => {
    const base =
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border'
    const map = {
      critical:
        'border-rose-500/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/15',
      warning:
        'border-amber-500/40 bg-amber-500/10 text-amber-100 hover:bg-amber-500/15',
      info: 'border-sky-500/40 bg-sky-500/10 text-sky-100 hover:bg-sky-500/15',
      all: 'border-slate-500/40 bg-slate-800/60 text-slate-100 hover:bg-slate-700',
    }
    const color = type === 'all' ? map.all : map[type]
    return `${base} ${color} ${value === alertFilter ? 'ring-1 ring-offset-1 ring-offset-slate-900 ring-slate-400/60' : ''}`
  }

  return (
    <>
      <header className="backdrop-blur-md bg-white/80 border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Left: menu + logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="inline-flex lg:hidden items-center justify-center rounded-lg p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="hidden lg:flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-tr from-primary-500 via-indigo-500 to-secondary-500 rounded-xl shadow-sm flex items-center justify-center">
                <span className="text-xs font-semibold text-white tracking-tight">
                  AW
                </span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-base font-bold text-slate-900">
                  Amsol Water Vend
                </span>
                <span className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                  Operator Console
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center px-4" />

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Alerts / notifications button */}
            <button
              className="relative p-2 rounded-lg border border-slate-200/70 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors shadow-sm"
              onClick={() => {
                setAlertsOpen(true)
                setDropdownOpen(false)
              }}
            >
              <Bell className="w-5 h-5" />
              {alertCounts.total > 0 && (
                <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[16px] h-4 rounded-full bg-rose-500 text-[10px] font-semibold text-white px-[3px]">
                  {alertCounts.total}
                </span>
              )}
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setDropdownOpen((v) => !v)
                }}
                className="flex items-center space-x-3 pl-1 pr-2 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 shadow-sm transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-tr from-primary-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {initials}
                </div>
                <div className="hidden sm:flex flex-col items-start leading-tight mr-1">
                  <span className="text-xs font-semibold text-slate-900">
                    {user?.first_name || user?.email || 'User'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                    <span className="inline-flex items-center px-2 py-[2px] rounded-full bg-slate-100 text-[10px] uppercase tracking-wide">
                      {roleLabel}
                    </span>
                  </span>
                </div>
                <ChevronDown className="hidden sm:block w-4 h-4 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200/80 py-2">
                  <div className="px-4 pb-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-semibold text-slate-800">
                      Signed in as
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user?.email}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="w-full flex items-center px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => navigate('/profile')}
                  >
                    <User className="w-4 h-4 mr-2 text-slate-400" />
                    Profile
                  </button>
                  <button
                    type="button"
                    className="w-full flex items-center px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => navigate('/settings')}
                  >
                    <Settings className="w-4 h-4 mr-2 text-slate-400" />
                    Settings
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Alerts slide-over panel */}
      {alertsOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
            onClick={() => setAlertsOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-950 text-slate-50 shadow-2xl border-l border-slate-800 flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/70 bg-slate-950/80 backdrop-blur">
              <div>
                <p className="text-sm font-semibold tracking-wide text-slate-50">
                  Alerts Center
                </p>
                <p className="text-[11px] text-slate-400">
                  {alertsLoading
                    ? 'Loading alerts...'
                    : `${alertCounts.total} total • ${alertCounts.critical} critical • ${alertCounts.warning} warnings`}
                </p>
              </div>
              <button
                onClick={() => setAlertsOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-4 py-3 border-b border-slate-800/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <Filter className="w-3 h-3" />
                <span>Filter</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAlertFilter('all')}
                  className={alertChipClass('all', 'all')}
                >
                  <span>All</span>
                  <span className="text-[10px] opacity-80">
                    {alertCounts.total}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setAlertFilter('critical')}
                  className={alertChipClass('critical', 'critical')}
                >
                  <span>Critical</span>
                  <span className="text-[10px] opacity-80">
                    {alertCounts.critical}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setAlertFilter('warning')}
                  className={alertChipClass('warning', 'warning')}
                >
                  <span>Warnings</span>
                  <span className="text-[10px] opacity-80">
                    {alertCounts.warning}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setAlertFilter('info')}
                  className={alertChipClass('info', 'info')}
                >
                  <span>Info</span>
                  <span className="text-[10px] opacity-80">
                    {alertCounts.info}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 text-sm">
              {alertsLoading ? (
                <div className="mt-10 flex flex-col items-center text-center text-slate-500 text-xs">
                  <div className="w-7 h-7 border-2 border-slate-600 border-t-transparent rounded-full animate-spin mb-3" />
                  <p>Loading alerts…</p>
                </div>
              ) : filteredAlerts.length === 0 ? (
                <div className="mt-10 flex flex-col items-center text-center text-slate-500 text-xs">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400 mb-2" />
                  <p>No alerts matching current filter</p>
                </div>
              ) : (
                filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="rounded-lg border border-slate-800/80 bg-slate-900/80 px-3 py-2.5 flex gap-3 hover:border-slate-600 transition-colors"
                  >
                    <div className="mt-0.5">
                      {renderAlertIcon(alert.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-50 truncate">
                          {alert.title}
                        </p>
                        <span className="text-[10px] text-slate-500">
                          {formatDateTime(alert.created_at, {
                            locale: 'en-GB',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                        {alert.message}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                        {alert.status && (
                          <span className="inline-flex items-center px-1.5 py-[1px] rounded-full bg-slate-800/80 border border-slate-700">
                            {alert.status}
                          </span>
                        )}
                        {alert.object_type && (
                          <span className="inline-flex items-center px-1.5 py-[1px] rounded-full bg-slate-800/80 border border-slate-700">
                            {alert.object_type}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-4 py-3 border-t border-slate-800/70 bg-slate-950/90 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="inline-flex w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Realtime sync</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAlertsOpen(false)
                  navigate('/alerts')
                }}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-primary-200 hover:text-white px-3 py-1.5 rounded-full bg-primary-600/20 border border-primary-500/70"
              >
                Open alerts center
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default Header
