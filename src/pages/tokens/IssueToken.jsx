// src/pages/tokens/IssueToken.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTokenStore, useMeterStore, useCustomerStore } from '@/store'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Alert from '@/components/common/Alert'
import { ArrowLeft } from 'lucide-react'

const IssueToken = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const { issueToken, isLoading, error, clearError } = useTokenStore()
  const { meters, fetchMeters } = useMeterStore()
  const { customers, fetchCustomers } = useCustomerStore()

  const [formData, setFormData] = useState({
    meter_id: '',
    customer_id: '',
    amount: '',
    vend_type: 'amount', // 'amount' | 'unit'
  })
  const [success, setSuccess] = useState(false)
  const [token, setToken] = useState(null)

  // Load meters & customers once
  useEffect(() => {
    fetchMeters?.()
    fetchCustomers?.()
  }, [fetchMeters, fetchCustomers])

  // Pre-select meter from query string (?meter=<uuid>)
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const meterParam = params.get('meter')
    if (meterParam) {
      setFormData((prev) => ({ ...prev, meter_id: meterParam }))
    }
  }, [location.search])

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }))
  }

  const handleVendTypeChange = (e) => {
    const vend_type = e.target.value
    setFormData((prev) => ({
      ...prev,
      vend_type,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError?.()
    setSuccess(false)
    setToken(null)

    // Basic guard
    if (!formData.meter_id || !formData.customer_id || !formData.amount) {
      return
    }

    const payload = {
      meter_id: formData.meter_id,          // UUID (pk)
      customer_id: formData.customer_id,    // UUID (pk)
      amount: parseFloat(formData.amount),
      is_vend_by_unit: formData.vend_type === 'unit',
    }

    const result = await issueToken(payload)

    if (result.success) {
      setSuccess(true)
      setToken(result.data)
      // optional auto-redirect:
      // setTimeout(() => navigate('/tokens'), 4000)
    }
  }

  const amountLabel =
    formData.vend_type === 'unit' ? 'Units (m³)' : 'Amount (KES)'

  return (
    <div>
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate('/tokens')}
          className="flex items-center text-primary-600 hover:text-primary-700 mr-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Issue Token</h1>
          <p className="text-slate-600 mt-1">Generate a new vending token</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        {success && token && (
          <Alert
            type="success"
            title="Token Issued Successfully"
            message={`Token: ${token.token_value}`}
            className="mb-6"
          />
        )}

        {error && (
          <Alert
            type="error"
            title="Error"
            message={error}
            className="mb-6"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Meter */}
          <div>
            <p className="text-sm text-slate-600 mb-1">Meter</p>
            <select
              value={formData.meter_id}
              onChange={handleChange('meter_id')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select Meter</option>
              {meters.map((meter) => (
                <option key={meter.id} value={meter.id}>
                  {meter.meter_id} {meter.location ? `- ${meter.location}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Customer */}
          <div>
            <p className="text-sm text-slate-600 mb-1">Customer</p>
            <select
              value={formData.customer_id}
              onChange={handleChange('customer_id')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select Customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} {customer.customer_id ? `(${customer.customer_id})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Vend type */}
          <div>
            <p className="text-sm text-slate-600 mb-1">Vend Type</p>
            <div className="flex gap-4">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  value="amount"
                  checked={formData.vend_type === 'amount'}
                  onChange={handleVendTypeChange}
                />
                By Amount (KES)
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  value="unit"
                  checked={formData.vend_type === 'unit'}
                  onChange={handleVendTypeChange}
                />
                By Units (m³)
              </label>
            </div>
          </div>

          {/* Amount / Units */}
          <div>
            <p className="text-sm text-slate-600 mb-1">{amountLabel}</p>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={handleChange('amount')}
              placeholder={formData.vend_type === 'unit' ? 'e.g. 30 (m³)' : 'e.g. 500 (KES)'}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" isLoading={isLoading}>
              Issue Token
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/tokens')}
            >
              Cancel
            </Button>
          </div>
        </form>

        {/* Optional: show token details nicely */}
        {success && token && (
          <div className="mt-6 border-t border-slate-200 pt-4 text-sm">
            <p className="font-semibold text-slate-900 mb-2">Token Details</p>
            <p><span className="text-slate-500">Token:</span> <span className="font-mono">{token.token_value}</span></p>
            <p><span className="text-slate-500">Meter:</span> {token.meter_id}</p>
            <p><span className="text-slate-500">Amount:</span> {token.amount}</p>
            <p><span className="text-slate-500">Status:</span> {token.status}</p>
          </div>
        )}
      </Card>
    </div>
  )
}

export default IssueToken
