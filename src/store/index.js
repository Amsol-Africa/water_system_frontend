// ============================================
// FILE: src/store/index.js
// Central exports + convenience utilities
// ============================================

export { useAuthStore } from './authStore'
export { useMeterStore } from './meterStore'
export { useCustomerStore } from './customerStore'
export { useTokenStore } from './tokenStore'
export { useAlertStore } from './alertStore'
export { useSettingsStore } from './settingsStore'
//export { useDashboardStore } from './dashboardStore'
//export { useReportStore } from './reportStore'
export { usePaymentStore } from './paymentStore'
export { useUserStore } from './userStore'
export { useClientStore } from './clientStore'

// ---- Default state shapes (useful for resets) ----
const DEFAULT_AUTH_STATE = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

const DEFAULT_METER_STATE = {
  meters: [],
  selectedMeter: null,
  isLoading: false,
  error: null,
  filters: { status: '', search: '' },
  pagination: { page: 1, pageSize: 10, total: 0 },
}

const DEFAULT_CUSTOMER_STATE = {
  customers: [],
  selectedCustomer: null,
  isLoading: false,
  error: null,
  filters: { search: '' },
  pagination: { page: 1, pageSize: 10, total: 0 },
}

const DEFAULT_TOKEN_STATE = {
  tokens: [],
  isLoading: false,
  error: null,
  filters: { status: '', type: '' },
}

// ---- Reset helpers (handy on logout or test teardown) ----
export const resetAuthStore = () => {
  const { useAuthStore: auth } = require('./authStore')
  auth.setState({ ...DEFAULT_AUTH_STATE })
}

export const resetMeterStore = () => {
  const { useMeterStore: meter } = require('./meterStore')
  meter.setState({ ...DEFAULT_METER_STATE })
}

export const resetCustomerStore = () => {
  const { useCustomerStore: customer } = require('./customerStore')
  customer.setState({ ...DEFAULT_CUSTOMER_STATE })
}

export const resetTokenStore = () => {
  const { useTokenStore: token } = require('./tokenStore')
  token.setState({ ...DEFAULT_TOKEN_STATE })
}

/**
 * Reset everything at once (e.g., after a full logout).
 * Note: order matters if you rely on cross-store state; here it’s neutral.
 */
export const resetAllStores = () => {
  resetAuthStore()
  resetMeterStore()
  resetCustomerStore()
  resetTokenStore()
}

// ---- Persist helpers (only authStore uses persist right now) ----
/** Clears only the persisted auth slice from storage and resets in-memory state */
export const clearPersistedAuth = async () => {
  const { useAuthStore: auth } = require('./authStore')
  if (auth.persist?.clearStorage) {
    await auth.persist.clearStorage()
  }
  resetAuthStore()
}

/** Forces rehydration from storage (useful after login bootstrap) */
export const rehydrateAuth = async () => {
  const { useAuthStore: auth } = require('./authStore')
  if (auth.persist?.rehydrate) {
    await auth.persist.rehydrate()
  }
}

// ---- Snapshots for debugging/analytics ----
export const getStoresSnapshot = () => {
  const { useAuthStore: auth } = require('./authStore')
  const { useMeterStore: meter } = require('./meterStore')
  const { useCustomerStore: customer } = require('./customerStore')
  const { useTokenStore: token } = require('./tokenStore')

  return {
    auth: auth.getState(),
    meter: meter.getState(),
    customer: customer.getState(),
    token: token.getState(),
  }
}

// ---- Tiny selector helpers (optional ergonomics) ----
export const selectAuthUser = (state) => state.user
export const selectIsAuthenticated = (state) => state.isAuthenticated
export const selectMeters = (state) => state.meters
export const selectSelectedMeter = (state) => state.selectedMeter
export const selectCustomers = (state) => state.customers
export const selectSelectedCustomer = (state) => state.selectedCustomer
export const selectTokens = (state) => state.tokens
export const selectIsLoading = (state) => state.isLoading
export const selectError = (state) => state.error