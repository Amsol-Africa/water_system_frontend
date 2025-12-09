// ============================================
//  src/components/layout/Sidebar.jsx 
// ============================================
import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks'
import {
  NAVIGATION_ITEMS,
  ADMIN_NAVIGATION_ITEMS,
  USER_ROLES,
} from '@/utils/constants'
import * as Icons from 'lucide-react'
import {
  X,
  ExternalLink,
  LogOut,
  ChevronRight,
  BarChart3,
  Settings as SettingsIcon,
  HelpCircle,
} from 'lucide-react'
import { useMeterStore, useTokenStore, usePaymentStore } from '@/store'

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const isSystemAdmin = user?.role === USER_ROLES.SYSTEM_ADMIN

  const { meters } = useMeterStore()
  const { tokens } = useTokenStore()
  const { payments } = usePaymentStore()

  const activeMeters = meters.filter((m) => m.status === 'active').length
  const failedTokens = tokens.filter((t) => t.status === 'failed').length
  const failedPayments = payments.filter((p) => p.status === 'failed').length

  // Minimal, safe submenu items (we know these routes exist)
  const reportsItems = [
    { name: 'Overview', href: '/reports', icon: 'BarChart3' },
  ]

  const settingsItems = [
    { name: 'General', href: '/settings', icon: 'Settings' },
  ]

  const [reportsExpanded, setReportsExpanded] = React.useState(false)
  const [settingsExpanded, setSettingsExpanded] = React.useState(false)

  // Auto-expand if on a reports or settings page
  React.useEffect(() => {
    if (location.pathname.startsWith('/reports')) {
      setReportsExpanded(true)
    }
    if (location.pathname.startsWith('/settings')) {
      setSettingsExpanded(true)
    }
  }, [location.pathname])

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard'
    }
    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    )
  }

  const getIcon = (iconName) => {
    const Icon = Icons[iconName]
    return Icon ? <Icon className="w-4 h-4" /> : null
  }

  const metricBadgeByHref = {
    '/meters': {
      value: activeMeters,
      tone: 'emerald',
      label: 'active',
    },
    '/tokens': {
      value: failedTokens,
      tone: 'rose',
      label: 'failed',
    },
    '/payments': {
      value: failedPayments,
      tone: 'amber',
      label: 'failed',
    },
  }

  const badgeToneClass = (tone) => {
    switch (tone) {
      case 'emerald':
        return 'bg-emerald-500/15 text-emerald-100 border-emerald-400/60'
      case 'rose':
        return 'bg-rose-500/15 text-rose-100 border-rose-400/60'
      case 'amber':
        return 'bg-amber-500/15 text-amber-100 border-amber-400/60'
      default:
        return 'bg-white/10 text-slate-100 border-white/20'
    }
  }

  const renderMetricBadge = (href) => {
    const badge = metricBadgeByHref[href]
    if (!badge || !badge.value) return null
    return (
      <span
        className={`
          ml-auto text-[11px] inline-flex items-center gap-1 px-2 py-[2px]
          rounded-full border ${badgeToneClass(badge.tone)}
        `}
      >
        <span>{badge.value}</span>
        <span className="uppercase tracking-[0.1em] opacity-80">
          {badge.label}
        </span>
      </span>
    )
  }

  const renderNavItem = (item, isAdmin = false) => {
    const active = isActive(item.href)
    return (
      <Link
        key={item.name}
        to={item.href}
        onClick={onClose}
        className={`
          group relative flex items-center px-3 py-2 text-sm font-medium rounded-lg
          transition-all duration-150
          ${
            active
              ? 'bg-cyan-500 text-white shadow-md'
              : 'text-slate-100 hover:bg-white/10'
          }
        `}
      >
        <span
          className={`
            relative z-[1] inline-flex items-center justify-center 
            w-8 h-8 rounded-lg border
            ${
              active
                ? 'border-white/40 bg-cyan-600/80 text-white'
                : 'border-white/20 bg-white/5 text-slate-100 group-hover:border-white/40'
            }
          `}
        >
          {getIcon(item.icon)}
        </span>
        <span className="relative z-[1] ml-3 truncate">{item.name}</span>
        {renderMetricBadge(item.href)}
        {isAdmin && (
          <span className="relative z-[1] ml-2 text-[10px] uppercase tracking-wide text-cyan-100">
            Admin
          </span>
        )}
      </Link>
    )
  }

  const renderSubmenuItem = (item) => {
    const active = isActive(item.href)
    return (
      <Link
        key={item.name}
        to={item.href}
        onClick={onClose}
        className={`
          flex items-center pl-11 pr-3 py-2 text-sm rounded-lg
          transition-all duration-150
          ${
            active
              ? 'bg-cyan-500/20 text-white font-medium'
              : 'text-slate-200 hover:bg-white/5 hover:text-white'
          }
        `}
      >
        <span className="mr-2 flex items-center justify-center w-5">
          {getIcon(item.icon)}
        </span>
        <span className="truncate">{item.name}</span>
      </Link>
    )
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
      navigate('/login')
    }
  }

  const initials =
    (user?.first_name?.[0] || user?.email?.[0] || 'U').toUpperCase()

  const roleLabel = user?.role
    ? user.role.replace(/_/g, ' ').toLowerCase()
    : 'operator'

  // Filter nav to avoid duplicate "Reports" & "Settings"
  const filteredNavItems = NAVIGATION_ITEMS.filter(
    (item) => item.href !== '/reports' && item.href !== '/settings',
  )

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 
          bg-[#113877] text-white
          border-r border-white/10 shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:relative
          flex flex-col
        `}
      >
        {/* Logo / top area */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/10 flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              navigate('/dashboard')
              onClose()
            }}
            className="flex items-center space-x-3"
          >
            <div className="w-9 h-9 bg-gradient-to-tr from-emerald-400 via-cyan-400 to-blue-500 rounded-2xl shadow-md flex items-center justify-center">
              <span className="text-xs font-semibold text-white tracking-tight">
                AW
              </span>
            </div>
            <div className="flex flex-col leading-tight text-left">
              <span className="text-sm font-semibold text-white">
                Amsol Water Vend
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-100/80">
                Console
              </span>
            </div>
          </button>
          <button
            onClick={onClose}
            className="lg:hidden text-white/70 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation - Scrollable area */}
        <nav className="flex-1 px-3 py-4 space-y-3 overflow-y-auto custom-scrollbar">
          <div>
            <p className="px-3 mb-1 text-[11px] font-semibold text-white/60 uppercase tracking-[0.22em]">
              Overview
            </p>
            <div className="space-y-1.5">
              {filteredNavItems.map((item) => renderNavItem(item, false))}
            </div>
          </div>

          {/* Reports Section with dropdown */}
          <div className="pt-2">
            <button
              onClick={() => setReportsExpanded(!reportsExpanded)}
              className={`
                w-full group relative flex items-center px-3 py-2 text-sm font-medium rounded-lg
                transition-all duration-150
                ${
                  isActive('/reports')
                    ? 'bg-cyan-500 text-white shadow-md'
                    : 'text-slate-100 hover:bg-white/10'
                }
              `}
            >
              <span
                className={`
                  relative z-[1] inline-flex items-center justify-center 
                  w-8 h-8 rounded-lg border
                  ${
                    isActive('/reports')
                      ? 'border-white/40 bg-cyan-600/80 text-white'
                      : 'border-white/20 bg-white/5 text-slate-100 group-hover:border-white/40'
                  }
                `}
              >
                <BarChart3 className="w-5 h-5" />
              </span>
              <span className="relative z-[1] ml-3 truncate flex-1 text-left">
                Reports
              </span>
              <ChevronRight
                className={`w-4 h-4 transition-transform duration-200 ${
                  reportsExpanded ? 'rotate-90' : ''
                }`}
              />
            </button>
            {reportsExpanded && (
              <div className="mt-1 space-y-0.5 animate-fade-in">
                {reportsItems.map((item) => renderSubmenuItem(item))}
              </div>
            )}
          </div>

          {/* Settings Section with dropdown */}
          <div className="pt-2">
            <button
              onClick={() => setSettingsExpanded(!settingsExpanded)}
              className={`
                w-full group relative flex items-center px-3 py-2 text-sm font-medium rounded-lg
                transition-all duration-150
                ${
                  isActive('/settings')
                    ? 'bg-cyan-500 text-white shadow-md'
                    : 'text-slate-100 hover:bg-white/10'
                }
              `}
            >
              <span
                className={`
                  relative z-[1] inline-flex items-center justify-center 
                  w-8 h-8 rounded-lg border
                  ${
                    isActive('/settings')
                      ? 'border-white/40 bg-cyan-600/80 text-white'
                      : 'border-white/20 bg-white/5 text-slate-100 group-hover:border-white/40'
                  }
                `}
              >
                <SettingsIcon className="w-5 h-5" />
              </span>
              <span className="relative z-[1] ml-3 truncate flex-1 text-left">
                Settings
              </span>
              <ChevronRight
                className={`w-4 h-4 transition-transform duration-200 ${
                  settingsExpanded ? 'rotate-90' : ''
                }`}
              />
            </button>
            {settingsExpanded && (
              <div className="mt-1 space-y-0.5 animate-fade-in">
                {settingsItems.map((item) => renderSubmenuItem(item))}
              </div>
            )}
          </div>

          {/* Admin section */}
          {isSystemAdmin && (
            <div className="pt-3 mt-2 border-t border-white/10">
              <p className="px-3 mb-1 text-[11px] font-semibold text-white/60 uppercase tracking-[0.22em]">
                Administration
              </p>
              <div className="space-y-1.5">
                {ADMIN_NAVIGATION_ITEMS.map((item) =>
                  renderNavItem(item, true),
                )}
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="pt-2 pb-4">
            <button
              onClick={() => {
                navigate('/help')
                onClose()
              }}
              className="w-full group relative flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 text-slate-100 hover:bg-white/10"
            >
              <span className="relative z-[1] inline-flex items-center justify-center w-8 h-8 rounded-lg border border-white/20 bg-white/5 text-slate-100 group-hover:border-white/40">
                <HelpCircle className="w-5 h-5" />
              </span>
              <span className="relative z-[1] ml-3 truncate">
                Help & Support
              </span>
            </button>
          </div>
        </nav>

        {/* User section - Fixed at bottom */}
        <div className="p-4 border-t border-white/10 bg-[#0d2b5c] space-y-3 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-400 flex items-center justify-center shadow-md">
              <span className="text-sm font-semibold text-white">
                {initials}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">
                {user?.first_name || user?.email || 'User'}
              </p>
              <p className="text-[11px] text-cyan-100 truncate capitalize">
                {roleLabel}
              </p>
              <p className="text-[10px] text-emerald-200 mt-1 flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                Online
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => {
                navigate('/profile')
                onClose()
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/20 text-white/90 hover:border-white/60 transition-colors"
            >
              <Icons.User className="w-3.5 h-3.5" />
              Profile
            </button>
            <button
              type="button"
              onClick={() => {
                navigate('/settings')
                onClose()
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/20 text-white/90 hover:border-white/60 transition-colors"
            >
              <Icons.Settings className="w-3.5 h-3.5" />
              Settings
            </button>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/20 text-white/80 hover:border-white/60 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Docs
            </a>
          </div>

          {/* Logout button */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white/90 hover:text-white bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 hover:border-red-400/50 rounded-lg transition-all duration-150"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
