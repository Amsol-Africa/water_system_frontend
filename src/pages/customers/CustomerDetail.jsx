// ============================================
//    src/pages/customers/CustomerDetail.jsx
// ============================================
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCustomerStore, useMeterStore } from '@/store'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Alert from '@/components/common/Alert'
import {
  ArrowLeft,
  Link as LinkIcon,
  Unlink,
  Activity,
  Gauge,
  CreditCard,
  Droplets,
  User,
} from 'lucide-react'
import { formatDateTime, formatCurrency } from '@/utils/formatters'

const CustomerDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  // Customer store
  const {
    selectedCustomer,
    isLoading,
    error,
    getCustomer,
    assignMeter,
    unassignMeter,
    clearError,
    updateCustomer,
    deleteCustomer,
  } = useCustomerStore()

  // Meter store
  const {
    meters,
    fetchMeters,
    isLoading: metersLoading,
  } = useMeterStore()

  // UI state
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignMeterId, setAssignMeterId] = useState('')
  const [unassignMeterId, setUnassignMeterId] = useState('')
  const [assignStatus, setAssignStatus] = useState(null)
  const [meterSearch, setMeterSearch] = useState('')

  // Edit / delete state
  const [editing, setEditing] = useState(false)
  const [formValues, setFormValues] = useState({})
  const [saveStatus, setSaveStatus] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Load customer + meters
  useEffect(() => {
    if (id) {
      getCustomer(id)
      fetchMeters()
    }
  }, [id, getCustomer, fetchMeters])

  // Reset statuses and initialise form when customer changes
  useEffect(() => {
    if (selectedCustomer) {
      setAssignStatus(null)
      setSaveStatus(null)
      setFormValues({
        name: selectedCustomer.name || '',
        phone: selectedCustomer.phone || '',
        email: selectedCustomer.email || '',
        address: selectedCustomer.address || '',
        id_number: selectedCustomer.id_number || '',
        is_active: !!selectedCustomer.is_active,
      })
    }
  }, [selectedCustomer])

  // New customer placeholder
  const isNew = id === 'new'

  if (isNew) {
    return (
      <div>
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/customers')}
            className="flex items-center text-primary-600 hover:text-primary-700 mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              New Customer
            </h1>
            <p className="text-slate-600 mt-1">
              Customer creation form will go here.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading && !selectedCustomer) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!selectedCustomer) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600">Customer not found</p>
        <Button onClick={() => navigate('/customers')} className="mt-4">
          Back to Customers
        </Button>
      </div>
    )
  }

  const {
    customer_id,
    name,
    phone,
    email,
    address,
    id_number,
    is_active,
    client_name,
    metadata,
    meters_count,
    total_paid,
    total_units,
    tokens_count,
    last_payment_at,
    last_token_value,
    created_at,
    updated_at,
  } = selectedCustomer

  // ----- Handlers -----

  const handleAssignMeter = async (e) => {
    e?.preventDefault()
    if (!assignMeterId || !selectedCustomer?.id) return

    setAssignStatus(null)
    const res = await assignMeter(selectedCustomer.id, assignMeterId)
    if (res.success) {
      await getCustomer(selectedCustomer.id)

      setAssignStatus({
        type: 'success',
        message: 'Meter assigned successfully',
      })
      setAssignMeterId('')
      setUnassignMeterId('')
      setAssignOpen(false)
    } else {
      setAssignStatus({
        type: 'error',
        message: res.error || 'Failed to assign meter',
      })
    }
  }

  const handleUnassign = async () => {
    if (!selectedCustomer?.id || !unassignMeterId) return
    setAssignStatus(null)
    const res = await unassignMeter(selectedCustomer.id, unassignMeterId)
    if (res.success) {
      await getCustomer(selectedCustomer.id)

      setAssignStatus({
        type: 'success',
        message: 'Meter unassigned successfully',
      })
      setUnassignMeterId('')
    } else {
      setAssignStatus({
        type: 'error',
        message: res.error || 'Failed to unassign meter',
      })
    }
  }

  const handleFieldChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSaveCustomer = async () => {
    if (!selectedCustomer?.id) return
    setSaveStatus(null)

    const payload = {
      name: formValues.name,
      phone: formValues.phone,
      email: formValues.email,
      address: formValues.address,
      id_number: formValues.id_number,
      is_active: !!formValues.is_active,
    }

    const res = await updateCustomer(selectedCustomer.id, payload)
    if (res.success) {
      setSaveStatus({ type: 'success', message: 'Customer updated successfully' })
      setEditing(false)
    } else {
      setSaveStatus({
        type: 'error',
        message: res.error || 'Failed to update customer',
      })
    }
  }

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer?.id) return
    if (!window.confirm('Delete this customer? This action cannot be undone.')) {
      return
    }

    setDeleteLoading(true)
    const res = await deleteCustomer(selectedCustomer.id)
    setDeleteLoading(false)

    if (res.success) {
      navigate('/customers')
    } else {
      setSaveStatus({
        type: 'error',
        message: res.error || 'Failed to delete customer',
      })
    }
  }

  // Filter available meters by search
  const filteredMeters = (meters || []).filter((m) => {
    if (!meterSearch) return true
    const q = meterSearch.toLowerCase()
    return (
      m.meter_id?.toLowerCase().includes(q) ||
      m.location_name?.toLowerCase?.().includes(q) ||
      m.location?.toLowerCase?.().includes(q) ||
      m.description?.toLowerCase?.().includes(q)
    )
  })

  const formattedTotalPaid = formatCurrency(total_paid || 0, {
    currency: 'KES',
    locale: 'en-KE',
  })

  const formattedTotalUnits =
    total_units != null ? `${total_units} m³` : '0 m³'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center mb-4">
        <button
          onClick={() => navigate('/customers')}
          className="mr-4 flex items-center text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            {name}
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                is_active
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              {is_active ? 'Active' : 'Inactive'}
            </span>
          </h1>
          <p className="text-slate-600 mt-1">
            Customer profile, meters and activity
          </p>
        </div>
      </div>

      {error && (
        <Alert
          type="error"
          title="Error"
          message={error}
          onClose={clearError}
        />
      )}

      {/* Top grid: info + summary + actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info card */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 mb-0 flex items-center gap-2">
              <User className="w-4 h-4 text-primary-500" />
              Customer Information
            </h2>
            <div className="flex items-center gap-2">
              {editing ? (
                <>
                  <Button size="sm" onClick={handleSaveCustomer}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(false)
                      setFormValues({
                        name,
                        phone,
                        email,
                        address,
                        id_number,
                        is_active,
                      })
                      setSaveStatus(null)
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditing(true)}
                >
                  Edit
                </Button>
              )}

              <Button
                size="sm"
                variant="danger"
                onClick={handleDeleteCustomer}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>

          {saveStatus && (
            <Alert
              type={saveStatus.type}
              title={saveStatus.type === 'success' ? 'Success' : 'Error'}
              message={saveStatus.message}
              onClose={() => setSaveStatus(null)}
              className="mb-3"
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                Customer ID
              </p>
              <p className="font-medium text-slate-900">
                {customer_id || '-'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                Client
              </p>
              <p className="font-medium text-slate-900">
                {client_name || '-'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                Phone
              </p>
              {editing ? (
                <Input
                  name="phone"
                  value={formValues.phone}
                  onChange={handleFieldChange}
                />
              ) : (
                <p className="font-medium text-slate-900">
                  {phone || '-'}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                Email
              </p>
              {editing ? (
                <Input
                  name="email"
                  value={formValues.email}
                  onChange={handleFieldChange}
                />
              ) : (
                <p className="font-medium text-slate-900">
                  {email || '-'}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                ID Number
              </p>
              {editing ? (
                <Input
                  name="id_number"
                  value={formValues.id_number}
                  onChange={handleFieldChange}
                />
              ) : (
                <p className="font-medium text-slate-900">
                  {id_number || '-'}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                Status
              </p>
              {editing ? (
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={!!formValues.is_active}
                    onChange={handleFieldChange}
                  />
                  Active
                </label>
              ) : (
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                    is_active
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {is_active ? 'Active' : 'Inactive'}
                </span>
              )}
            </div>
            <div className="md:col-span-2">
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                Address
              </p>
              {editing ? (
                <Input
                  name="address"
                  value={formValues.address}
                  onChange={handleFieldChange}
                />
              ) : (
                <p className="font-medium text-slate-900">
                  {address || '-'}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                Created At
              </p>
              <p className="font-medium text-slate-900">
                {created_at ? formatDateTime(created_at) : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                Last Updated
              </p>
              <p className="font-medium text-slate-900">
                {updated_at ? formatDateTime(updated_at) : '-'}
              </p>
            </div>
          </div>

          {/* Metadata */}
          {metadata && Object.keys(metadata || {}).length > 0 && (
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                Extra Metadata
              </p>
              <pre className="max-h-48 overflow-auto rounded-lg bg-slate-50 p-2 text-xs text-slate-700">
                {JSON.stringify(metadata, null, 2)}
              </pre>
            </div>
          )}
        </Card>

        {/* Summary + actions */}
        <div className="space-y-4">
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary-500" />
              Summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Meters linked</span>
                <span className="font-semibold text-slate-900">
                  {meters_count ?? 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Spend</span>
                <span className="font-semibold text-slate-900">
                  {formattedTotalPaid}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Units</span>
                <span className="font-semibold text-slate-900">
                  {formattedTotalUnits}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tokens Issued</span>
                <span className="font-semibold text-slate-900">
                  {tokens_count ?? 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last Payment</span>
                <span className="font-semibold text-slate-900">
                  {last_payment_at ? formatDateTime(last_payment_at) : '-'}
                </span>
              </div>
            </div>

            {last_token_value && (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                  Last Token
                </p>
                <p className="font-mono text-xs break-all bg-slate-50 rounded-md px-2 py-1">
                  {last_token_value}
                </p>
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => setAssignOpen((prev) => !prev)}
              >
                <LinkIcon className="w-4 h-4" />
                {assignOpen ? 'Close Meter Assignment' : 'Assign / Unassign Meter'}
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={() =>
                  navigate(`/tokens?customer=${selectedCustomer.id}`)
                }
              >
                <Droplets className="w-4 h-4" />
                View Tokens
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={() =>
                  navigate(`/payments?phone=${encodeURIComponent(phone || '')}`)
                }
              >
                <CreditCard className="w-4 h-4" />
                View Payments
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Assign / Unassign meter panel */}
      {assignOpen && (
        <Card className="border-primary-100 bg-primary-50/40">
          <h2 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-primary-500" />
            Manage Meter Assignments
          </h2>

          {assignStatus && (
            <Alert
              type={assignStatus.type}
              title={
                assignStatus.type === 'success'
                  ? 'Success'
                  : 'Meter Assignment'
              }
              message={assignStatus.message}
              onClose={() => setAssignStatus(null)}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 text-sm">
            {/* Assign block */}
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                Assign Meter
              </p>
              <form
                onSubmit={handleAssignMeter}
                className="space-y-3"
              >
                <Input
                  label="Filter meters"
                  placeholder="Search meters by ID or location..."
                  value={meterSearch}
                  onChange={(e) => setMeterSearch(e.target.value)}
                />
                <select
                  value={assignMeterId}
                  onChange={(e) => setAssignMeterId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={metersLoading}
                >
                  <option value="">Select meter...</option>
                  {filteredMeters.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.meter_id} – {m.location_name || m.location || m.description || ''}
                    </option>
                  ))}
                </select>
                <Button
                  type="submit"
                  disabled={!assignMeterId || metersLoading}
                >
                  Assign to Customer
                </Button>
              </form>
            </div>

            {/* Unassign block */}
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                Unassign Meter
              </p>
              <p className="text-xs text-slate-500 mb-2">
                Select a meter to remove its active assignment from this
                customer. If the meter is not currently assigned, the request
                will be ignored by the backend.
              </p>
              <div className="space-y-3">
                <select
                  value={unassignMeterId}
                  onChange={(e) => setUnassignMeterId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={metersLoading}
                >
                  <option value="">Select meter to unassign...</option>
                  {filteredMeters.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.meter_id} – {m.location_name || m.location || m.description || ''}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!unassignMeterId}
                  className="inline-flex items-center gap-2"
                  onClick={handleUnassign}
                >
                  <Unlink className="w-4 h-4" />
                  Unassign Meter
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default CustomerDetail
