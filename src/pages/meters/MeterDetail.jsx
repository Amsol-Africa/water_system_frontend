// ============================================
// FILE: src/pages/meters/MeterDetail.jsx (Enhanced)
// ============================================
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMeterStore, useTokenStore } from '@/store'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Badge from '@/components/common/Badge'
import Alert from '@/components/common/Alert'
import { 
  ArrowLeft, 
  MapPin, 
  Gauge, 
  Calendar, 
  User, 
  Activity,
  TrendingUp,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { formatDateTime, getStatusColor, formatCurrency } from '@/utils/formatters'

const statusConfig = {
  active: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
  suspended: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertTriangle },
  tamper: { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle },
  fault: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
  offline: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: XCircle },
};

const InfoRow = ({ icon: Icon, label, value, valueClassName = "font-medium text-slate-900" }) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
    <div className="mt-0.5">
      <Icon size={18} className="text-slate-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-slate-600 mb-1">{label}</p>
      <p className={`text-sm ${valueClassName} break-words`}>{value}</p>
    </div>
  </div>
);

const StatCard = ({ icon: Icon, label, value, subtext, color = "primary" }) => {
  const colorClasses = {
    primary: "bg-primary-50 text-primary-600 border-primary-100",
    green: "bg-green-50 text-green-600 border-green-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100"
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg border ${colorClasses[color]}`}>
          <Icon size={20} />
        </div>
      </div>
      <div>
        <p className="text-sm text-slate-600 mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
      </div>
    </div>
  );
};

const MeterDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    selectedMeter,
    isLoading,
    getMeter,
    queryMeter,
    error,
    clearError,
    suspendMeter,
    resumeMeter,
  } = useMeterStore()

  const { clearCredit, clearTamper } = useTokenStore()

  const [statusData, setStatusData] = useState(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const [statusError, setStatusError] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState(null)

  useEffect(() => {
    if (id !== 'new') {
      getMeter(id)
    }
  }, [id, getMeter])

  const handleClearCredit = async () => {
    if (!selectedMeter?.id || !selectedMeter?.current_customer_id) {
      setActionMessage({
        type: 'error',
        text: 'No assigned customer found for this meter to clear credit against.',
      })
      return
    }
    setActionLoading(true)
    setActionMessage(null)

    const res = await clearCredit(selectedMeter.id, selectedMeter.current_customer_id)

    setActionLoading(false)
    if (res.success) {
      setActionMessage({
        type: 'success',
        text: 'Clear credit token issued successfully.',
      })
    } else {
      setActionMessage({
        type: 'error',
        text: res.error || 'Failed to clear credit',
      })
    }
  }

  const handleClearTamper = async () => {
    if (!selectedMeter?.id || !selectedMeter?.current_customer_id) {
      setActionMessage({
        type: 'error',
        text: 'No assigned customer found for this meter to clear tamper against.',
      })
      return
    }
    setActionLoading(true)
    setActionMessage(null)

    const res = await clearTamper(selectedMeter.id, selectedMeter.current_customer_id)

    setActionLoading(false)
    if (res.success) {
      setActionMessage({
        type: 'success',
        text: 'Clear tamper token issued successfully.',
      })
    } else {
      setActionMessage({
        type: 'error',
        text: res.error || 'Failed to clear tamper',
      })
    }
  }

  const handleSuspendMeter = async () => {
    if (!selectedMeter?.id) return
    if (!window.confirm('Suspend this meter? Customers will not be able to vend.')) {
      return
    }

    setActionLoading(true)
    setActionMessage(null)
    const res = await suspendMeter(selectedMeter.id)
    setActionLoading(false)

    if (res.success) {
      setActionMessage({
        type: 'success',
        text: res.message || 'Meter suspended successfully.',
      })
    } else {
      setActionMessage({
        type: 'error',
        text: res.error || 'Failed to suspend meter',
      })
    }
  }

  const handleResumeMeter = async () => {
    if (!selectedMeter?.id) return
    setActionLoading(true)
    setActionMessage(null)

    const res = await resumeMeter(selectedMeter.id)
    setActionLoading(false)

    if (res.success) {
      setActionMessage({
        type: 'success',
        text: res.message || 'Meter resumed successfully.',
      })
    } else {
      setActionMessage({
        type: 'error',
        text: res.error || 'Failed to resume meter',
      })
    }
  }

  const handleQueryStatus = async () => {
    if (!selectedMeter?.meter_id) return

    setStatusLoading(true)
    setStatusError(null)
    clearError?.()

    const result = await queryMeter(selectedMeter.meter_id)

    setStatusLoading(false)

    if (result.success) {
      setStatusData(result.data)
    } else {
      setStatusError(result.error || 'Failed to query meter status')
    }
  }

  if (isLoading && !selectedMeter && id !== 'new') {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-slate-600">Loading meter details...</p>
        </div>
      </div>
    )
  }

  if (!selectedMeter && id !== 'new') {
    return (
      <div className="text-center py-20">
        <Gauge size={64} className="mx-auto text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Meter not found</h2>
        <p className="text-slate-600 mb-6">The meter you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/meters')}>
          <ArrowLeft size={18} className="mr-2" />
          Back to Meters
        </Button>
      </div>
    )
  }

  const StatusIcon = statusConfig[selectedMeter?.status]?.icon || CheckCircle;
  const statusStyle = statusConfig[selectedMeter?.status] || statusConfig.active;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => navigate('/meters')}
          className="mt-1 p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {selectedMeter?.meter_id || 'New Meter'}
              </h1>
              <p className="text-slate-600 mt-1">Meter details and management</p>
            </div>
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border ${statusStyle.color}`}>
              <StatusIcon size={16} />
              {selectedMeter?.status}
            </span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(error || statusError) && (
        <Alert
          type="error"
          message={error || statusError}
          onClose={() => {
            clearError?.()
            setStatusError(null)
          }}
        />
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Total Paid"
          value={formatCurrency(selectedMeter?.total_paid || 0, {
            currency: 'KES',
            locale: 'en-KE',
          })}
          color="green"
        />
        <StatCard
          icon={Gauge}
          label="Total Units"
          value={`${selectedMeter?.total_units ?? 0} m³`}
          color="blue"
        />
        <StatCard
          icon={Activity}
          label="Vends Count"
          value={selectedMeter?.total_vends ?? 0}
          color="primary"
        />
        <StatCard
          icon={Calendar}
          label="Last Vend"
          value={selectedMeter?.last_vended_at
            ? new Date(selectedMeter.last_vended_at).toLocaleDateString()
            : 'Never'}
          subtext={selectedMeter?.last_vended_at
            ? new Date(selectedMeter.last_vended_at).toLocaleTimeString()
            : ''}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information Card */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary-50 to-cyan-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Gauge size={20} className="text-primary-600" />
                Meter Information
              </h2>
            </div>
            <div className="p-6 space-y-0">
              <InfoRow
                icon={Gauge}
                label="Meter ID"
                value={selectedMeter?.meter_id}
                valueClassName="font-bold text-slate-900"
              />
              <InfoRow
                icon={Activity}
                label="Meter Type"
                value={selectedMeter?.meter_type}
              />
              <InfoRow
                icon={MapPin}
                label="Location"
                value={selectedMeter?.location}
              />
              <InfoRow
                icon={User}
                label="Assigned Customer"
                value={selectedMeter?.current_customer_name || 'Not assigned'}
                valueClassName={selectedMeter?.current_customer_name ? "font-medium text-slate-900" : "font-medium text-slate-500 italic"}
              />
              <InfoRow
                icon={Calendar}
                label="Installed On"
                value={selectedMeter?.installed_on || 'Not recorded'}
              />
              <InfoRow
                icon={Calendar}
                label="Created"
                value={formatDateTime(selectedMeter?.created_at)}
              />
            </div>
          </Card>

          {/* System Totals Card */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-600" />
                System Totals
              </h2>
              <p className="text-xs text-slate-600 mt-1">Data from internal database</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Total Paid (KES)</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {formatCurrency(selectedMeter?.total_paid || 0, {
                        currency: 'KES',
                        locale: 'en-KE',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Total Units</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {selectedMeter?.total_units ?? 0} m³
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Vends Count</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {selectedMeter?.total_vends ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Last Vend</p>
                    <p className="text-sm font-medium text-slate-900">
                      {selectedMeter?.last_vended_at
                        ? formatDateTime(selectedMeter.last_vended_at)
                        : 'No vends yet'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Last Token</p>
                  <p className="font-mono text-xs text-slate-900 bg-slate-50 p-3 rounded border border-slate-200 break-all">
                    {selectedMeter?.last_token_value || 'No tokens issued'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Last Customer</p>
                  <p className="text-sm font-medium text-slate-900">
                    {selectedMeter?.last_customer_name || 'None'}
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800">
                  <span className="font-semibold">Note:</span> These figures are computed from tokens stored in this system
                  (excluding failed tokens). Stronpower live status may include
                  vends that were made directly from their portal.
                </p>
              </div>
            </div>
          </Card>

          {/* Live Stronpower Status Card */}
          {statusData && (
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Activity size={20} className="text-green-600" />
                  Live Meter Status
                </h2>
                <p className="text-xs text-slate-600 mt-1">Real-time data from Stronpower</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Customer</p>
                      <p className="font-semibold text-slate-900">
                        {statusData.Customer_name}
                      </p>
                      <p className="text-xs text-slate-500">ID: {statusData.Customer_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Contact</p>
                      <p className="text-sm text-slate-900">{statusData.Customer_address}</p>
                      <p className="text-sm text-slate-900">{statusData.Customer_phone}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Total Paid</p>
                      <p className="text-xl font-bold text-slate-900">
                        {statusData.Total_paid} {statusData.Price_unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Total Units</p>
                      <p className="text-xl font-bold text-slate-900">
                        {statusData.Total_unit} {statusData.Unit}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Price / Rate</p>
                    <p className="text-sm font-medium text-slate-900">
                      {statusData.Price} {statusData.Price_unit} (rate {statusData.Rate})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Vends Count</p>
                    <p className="text-sm font-medium text-slate-900">
                      {statusData.Total_times}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Actions Panel - Right Side */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Zap size={20} className="text-slate-700" />
                Actions
              </h2>
            </div>

            <div className="p-6 space-y-3">
              {actionMessage && (
                <Alert
                  type={actionMessage.type}
                  message={actionMessage.text}
                  onClose={() => setActionMessage(null)}
                  className="mb-4"
                />
              )}

              <Button
                variant="outline"
                className="w-full justify-center"
                onClick={handleQueryStatus}
                isLoading={statusLoading}
              >
                <Activity size={18} className="mr-2" />
                Query Live Status
              </Button>

              <Button
                variant="outline"
                className="w-full justify-center"
                onClick={() =>
                  navigate('/tokens/issue?meter=' + (selectedMeter?.id || ''))
                }
                disabled={!selectedMeter?.id}
              >
                <Zap size={18} className="mr-2" />
                Issue Token
              </Button>

              <div className="border-t border-slate-200 my-4"></div>

              <Button
                variant="outline"
                className="w-full justify-center"
                onClick={handleClearCredit}
                disabled={!selectedMeter?.id || actionLoading}
              >
                <TrendingUp size={18} className="mr-2" />
                Clear Credit
              </Button>

              <Button
                variant="outline"
                className="w-full justify-center"
                onClick={handleClearTamper}
                disabled={!selectedMeter?.id || actionLoading}
              >
                <Shield size={18} className="mr-2" />
                Clear Tamper
              </Button>

              <div className="border-t border-slate-200 my-4"></div>

              <Button
                variant="danger"
                className="w-full justify-center"
                onClick={handleSuspendMeter}
                disabled={
                  !selectedMeter?.id ||
                  actionLoading ||
                  selectedMeter?.status === 'suspended'
                }
              >
                <XCircle size={18} className="mr-2" />
                Suspend Meter
              </Button>

              <Button
                variant="outline"
                className="w-full justify-center border-green-300 text-green-700 hover:bg-green-50"
                onClick={handleResumeMeter}
                disabled={
                  !selectedMeter?.id ||
                  actionLoading ||
                  selectedMeter?.status === 'active'
                }
              >
                <CheckCircle size={18} className="mr-2" />
                Resume Meter
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default MeterDetail