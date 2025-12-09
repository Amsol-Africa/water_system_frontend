// ============================================
// FILE 2: src/services/mockApi.js
// (For local development - Simulates backend & Stronpower)
// ============================================
import { delay, generateId } from '@/utils'

// Mock data storage
const mockData = {
  users: [
    {
      id: '1',
      email: 'admin@amsol.com',
      password: 'password123',
      first_name: 'Admin',
      last_name: 'User',
      role: 'system_admin',
      client_id: null,
    },
    {
      id: '2',
      email: 'operator@amsol.com',
      password: 'password123',
      first_name: 'John',
      last_name: 'Operator',
      role: 'operator',
      client_id: 'client-1',
    },
  ],
  clients: [
    {
      id: 'client-1',
      name: 'Nairobi Water Company',
      paybill_number: '123456',
      created_at: new Date().toISOString(),
    },
  ],
  meters: [
    {
      id: 'meter-1',
      meter_id: '58100000007',
      client_id: 'client-1',
      meter_type: 'Water Meter',
      location: 'Westlands',
      status: 'active',
      installed_on: '2024-01-01',
      created_at: new Date().toISOString(),
    },
    {
      id: 'meter-2',
      meter_id: '58100000008',
      client_id: 'client-1',
      meter_type: 'Water Meter',
      location: 'CBD',
      status: 'tamper',
      installed_on: '2024-01-05',
      created_at: new Date().toISOString(),
    },
  ],
  customers: [
    {
      id: 'customer-1',
      client_id: 'client-1',
      customer_id: 'CUST-001',
      name: 'John Doe',
      phone: '+254712345678',
      email: 'john@example.com',
      address: 'Nairobi',
      created_at: new Date().toISOString(),
    },
  ],
  tokens: [],
  payments: [],
}

// Mock API functions
export const mockAuthService = {
  login: async (email, password) => {
    await delay(500)
    const user = mockData.users.find((u) => u.email === email && u.password === password)
    if (!user) {
      throw { response: { status: 401, data: { message: 'Invalid credentials' } } }
    }

    const token = generateId()
    const refreshToken = generateId()

    return {
      data: {
        access: token,
        refresh: refreshToken,
        user: { ...user, password: undefined },
      },
    }
  },

  logout: async () => {
    await delay(300)
    return { data: { message: 'Logout successful' } }
  },

  me: async () => {
    await delay(200)
    const user = mockData.users[0]
    return {
      data: { ...user, password: undefined },
    }
  },
}

export const mockMeterService = {
  list: async (params = {}) => {
    await delay(300)
    let meters = mockData.meters
    if (params.status) {
      meters = meters.filter((m) => m.status === params.status)
    }
    return {
      data: {
        results: meters,
        count: meters.length,
      },
    }
  },

  get: async (id) => {
    await delay(200)
    const meter = mockData.meters.find((m) => m.id === id)
    if (!meter) {
      throw { response: { status: 404, data: { message: 'Meter not found' } } }
    }
    return { data: meter }
  },

  create: async (data) => {
    await delay(400)
    const newMeter = {
      id: generateId(),
      ...data,
      created_at: new Date().toISOString(),
    }
    mockData.meters.push(newMeter)
    return { data: newMeter }
  },

  update: async (id, data) => {
    await delay(400)
    const meter = mockData.meters.find((m) => m.id === id)
    if (!meter) {
      throw { response: { status: 404, data: { message: 'Meter not found' } } }
    }
    Object.assign(meter, data)
    return { data: meter }
  },

  delete: async (id) => {
    await delay(300)
    const index = mockData.meters.findIndex((m) => m.id === id)
    if (index === -1) {
      throw { response: { status: 404, data: { message: 'Meter not found' } } }
    }
    mockData.meters.splice(index, 1)
    return { data: { message: 'Meter deleted' } }
  },

  query: async (meterId) => {
    await delay(200)
    const meter = mockData.meters.find((m) => m.meter_id === meterId)
    if (!meter) {
      throw { response: { status: 404, data: { message: 'Meter not found' } } }
    }
    return {
      data: {
        meter_id: meterId,
        status: meter.status,
        credit: Math.floor(Math.random() * 1000),
        tamper: meter.status === 'tamper',
      },
    }
  },
}

export const mockCustomerService = {
  list: async (params = {}) => {
    await delay(300)
    let customers = mockData.customers
    if (params.search) {
      const term = params.search.toLowerCase()
      customers = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.phone.includes(term) ||
          c.customer_id.includes(term)
      )
    }
    return {
      data: {
        results: customers,
        count: customers.length,
      },
    }
  },

  get: async (id) => {
    await delay(200)
    const customer = mockData.customers.find((c) => c.id === id)
    if (!customer) {
      throw { response: { status: 404, data: { message: 'Customer not found' } } }
    }
    return { data: customer }
  },

  create: async (data) => {
    await delay(400)
    const newCustomer = {
      id: generateId(),
      ...data,
      created_at: new Date().toISOString(),
    }
    mockData.customers.push(newCustomer)
    return { data: newCustomer }
  },

  update: async (id, data) => {
    await delay(400)
    const customer = mockData.customers.find((c) => c.id === id)
    if (!customer) {
      throw { response: { status: 404, data: { message: 'Customer not found' } } }
    }
    Object.assign(customer, data)
    return { data: customer }
  },

  delete: async (id) => {
    await delay(300)
    const index = mockData.customers.findIndex((c) => c.id === id)
    if (index === -1) {
      throw { response: { status: 404, data: { message: 'Customer not found' } } }
    }
    mockData.customers.splice(index, 1)
    return { data: { message: 'Customer deleted' } }
  },

  assignMeter: async (customerId, meterId) => {
    await delay(300)
    const customer = mockData.customers.find((c) => c.id === customerId)
    const meter = mockData.meters.find((m) => m.id === meterId)
    if (!customer || !meter) {
      throw { response: { status: 404, data: { message: 'Customer or Meter not found' } } }
    }
    return { data: { message: 'Meter assigned successfully' } }
  },
}

// Mock Stronpower API (for token simulation)
export const mockStronpowerService = {
  vendingMeter: async (meterId, amount, isVendByUnit = false) => {
    await delay(800) // Simulate API latency
    const token = `TOKEN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newToken = {
      id: generateId(),
      token_value: token,
      meter_id: meterId,
      amount,
      is_vend_by_unit: isVendByUnit,
      status: 'created',
      created_at: new Date().toISOString(),
    }
    mockData.tokens.push(newToken)
    return { data: newToken }
  },

  clearCredit: async (meterId) => {
    await delay(600)
    const token = `CLEAR-CREDIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    return { data: { token, type: 'clear_credit' } }
  },

  clearTamper: async (meterId) => {
    await delay(600)
    const token = `CLEAR-TAMPER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    return { data: { token, type: 'clear_tamper' } }
  },

  queryMeterInfo: async (meterId) => {
    await delay(400)
    return {
      data: {
        meter_id: meterId,
        status: 'active',
        credit: Math.floor(Math.random() * 1000),
        tamper: Math.random() > 0.8,
      },
    }
  },
}

export const mockTokenService = {
  list: async (params = {}) => {
    await delay(300)
    let tokens = mockData.tokens
    if (params.status) {
      tokens = tokens.filter((t) => t.status === params.status)
    }
    return {
      data: {
        results: tokens,
        count: tokens.length,
      },
    }
  },

  issue: async (data) => {
    return mockStronpowerService.vendingMeter(
      data.meter_id,
      data.amount,
      data.is_vend_by_unit
    )
  },

  clearCredit: async (meterId) => {
    return mockStronpowerService.clearCredit(meterId)
  },

  clearTamper: async (meterId) => {
    return mockStronpowerService.clearTamper(meterId)
  },
}
