// FILE 1: src/utils/constants.js
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Amsol Water Vending'
export const API_TIMEOUT = 30000

export const USER_ROLES = {
  SYSTEM_ADMIN: 'system_admin',
  CLIENT_ADMIN: 'client_admin',
  OPERATOR: 'operator',
  FIELD_ENGINEER: 'field_engineer',
  READ_ONLY: 'read_only',
}

export const ROLE_LABELS = {
  system_admin: 'System Admin',
  client_admin: 'Client Admin',
  operator: 'Operator',
  field_engineer: 'Field Engineer',
  read_only: 'Read Only Viewer',
}

export const METER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  TAMPER: 'tamper',
  FAULT: 'fault',
  OFFLINE: 'offline',
  MAINTENANCE: 'maintenance',
}

export const METER_STATUS_LABELS = {
  active: 'Active',
  suspended: 'Suspended',
  tamper: 'Tamper',
  fault: 'Fault',
  offline: 'Offline',
  maintenance: 'Maintenance',
}

export const METER_STATUS_COLORS = {
  active: 'bg-green-100 text-green-800 border-green-300',
  suspended: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  tamper: 'bg-red-100 text-red-800 border-red-300',
  fault: 'bg-orange-100 text-orange-800 border-orange-300',
  offline: 'bg-gray-100 text-gray-800 border-gray-300',
  maintenance: 'bg-blue-100 text-blue-800 border-blue-300',
}

export const TOKEN_STATUS = {
  CREATED: 'created',
  DELIVERED: 'delivered',
  REDEEMED: 'redeemed',
  EXPIRED: 'expired',
  FAILED: 'failed',
}

export const TOKEN_TYPE = {
  VENDING: 'vending',
  CLEAR_CREDIT: 'clear_credit',
  CLEAR_TAMPER: 'clear_tamper',
}

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  FAILED: 'failed',
  REFUNDED: 'refunded',
}

export const ALERT_SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
}

export const ALERT_SEVERITY_COLORS = {
  info: 'bg-blue-100 text-blue-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  critical: 'bg-red-200 text-red-900',
}

export const NAVIGATION_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { name: 'Meters', href: '/meters', icon: 'Gauge' },
  { name: 'Customers', href: '/customers', icon: 'Users' },
  { name: 'Tokens', href: '/tokens', icon: 'Ticket' },
  { name: 'Payments', href: '/payments', icon: 'CreditCard' },
  { name: 'Alerts', href: '/alerts', icon: 'Bell' },
  { name: 'Reports', href: '/reports', icon: 'ChartBar' },
  { name: 'Settings', href: '/settings', icon: 'Cog6Tooth' },
  ]
export const MOBILE_NAVIGATION_ITEMS = [
  ...NAVIGATION_ITEMS,
  { name: 'Profile', href: '/profile', icon: 'UserCircle' },
  { name: 'Logout', href: '/logout', icon: 'ArrowRightOnRectangle' },
  ]

export const ADMIN_NAVIGATION_ITEMS = [
  { name: 'User Management', href: '/admin/users', icon: 'UserPlus' },
  { name: 'System Settings', href: '/admin/settings', icon: 'SlidersHorizontal' },
]
