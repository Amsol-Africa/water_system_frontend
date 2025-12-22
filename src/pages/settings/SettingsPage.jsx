// ============================================
// FILE: src/pages/settings/SettingsPage.jsx
// ============================================
import React, { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { useSettingsStore, useAuthStore } from '@/store'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Alert from '@/components/common/Alert'

// NOTE:
// - Settings are for SYSTEM ADMIN only.
// - sms_sender_id should NOT be required (AT sender ID can be optional / varies by account).
const systemSettingsSchema = z.object({
  paybill_number: z.string().min(1, 'Paybill number is required').max(20),
  stronpower_company_name: z.string().min(1, 'Company name is required'),
  stronpower_username: z.string().min(1, 'Stronpower username is required'),
  stronpower_password: z.string().min(1, 'Stronpower password is required'),

  sms_sender_id: z.string().max(30).optional().or(z.literal('')),
  sms_callback_url: z.string().url('Invalid URL').optional().or(z.literal('')),

  notify_on_token_issue: z.boolean().default(true),
  notify_on_payment_failure: z.boolean().default(true),
  notify_on_critical_alert: z.boolean().default(true),
})

const SettingsPage = () => {
  const { user } = useAuthStore()

  // Block non-system-admin
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'system_admin') return <Navigate to="/dashboard" replace />

  const {
    systemSettings,
    isLoading,
    error,
    fetchSystemSettings,
    updateSystemSettings,
    clearError,
  } = useSettingsStore()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: {
      paybill_number: '',
      stronpower_company_name: '',
      stronpower_username: '',
      stronpower_password: '',
      sms_sender_id: '',
      sms_callback_url: '',
      notify_on_token_issue: true,
      notify_on_payment_failure: true,
      notify_on_critical_alert: true,
    },
    mode: 'onSubmit',
  })

  useEffect(() => {
    const load = async () => {
      const result = await fetchSystemSettings()
      if (result.success && result.data) {
        // Ensure booleans are actual booleans
        reset({
          ...result.data,
          notify_on_token_issue: !!result.data.notify_on_token_issue,
          notify_on_payment_failure: !!result.data.notify_on_payment_failure,
          notify_on_critical_alert: !!result.data.notify_on_critical_alert,
        })
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSubmit = async (data) => {
    const result = await updateSystemSettings(data)
    if (result.success && result.data) {
      reset(result.data) // resets dirty state
    }
  }

  const handleCheckboxChange = (name) => (e) => {
    setValue(name, e.target.checked, { shouldDirty: true, shouldTouch: true })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">System Settings</h1>
        <p className="mt-1 text-slate-600">
          System Admin only — configure paybill, Stronpower integration, and notification rules.
        </p>
      </div>

      {error && (
        <Alert type="error" title="Error" message={error} onClose={clearError} />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Payment / Paybill */}
        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Payment (M-Pesa Paybill)
            </h2>
            <p className="text-sm text-slate-600">
              The paybill used for C2B confirmation/validation mapping.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Paybill Number"
              placeholder="e.g., 123456"
              error={errors.paybill_number?.message}
              {...register('paybill_number')}
            />
          </div>
        </Card>

        {/* Stronpower integration */}
        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Stronpower Integration
            </h2>
            <p className="text-sm text-slate-600">
              Credentials used when calling the Stronpower vending API.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Company Name"
              placeholder="e.g., DicksonAbukal"
              error={errors.stronpower_company_name?.message}
              {...register('stronpower_company_name')}
            />
            <Input
              label="Username"
              placeholder="e.g., Prepaid"
              error={errors.stronpower_username?.message}
              {...register('stronpower_username')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.stronpower_password?.message}
              {...register('stronpower_password')}
            />
          </div>
        </Card>

        {/* SMS / Notifications */}
        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              SMS & Notifications
            </h2>
            <p className="text-sm text-slate-600">
              Africa’s Talking: sender ID is optional (depends on your account).
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="SMS Sender ID (optional)"
              placeholder="e.g., AMSOLWATER"
              error={errors.sms_sender_id?.message}
              {...register('sms_sender_id')}
            />
            <Input
              label="SMS Callback URL (optional)"
              placeholder="https://yourapp.com/api/sms/callback"
              error={errors.sms_callback_url?.message}
              {...register('sms_callback_url')}
            />
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={!!watch('notify_on_token_issue')}
                onChange={handleCheckboxChange('notify_on_token_issue')}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm">
                <span className="font-medium text-slate-900">Send SMS on token issue</span>
                <br />
                <span className="text-slate-500">
                  Customers receive a token SMS immediately after vending.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={!!watch('notify_on_payment_failure')}
                onChange={handleCheckboxChange('notify_on_payment_failure')}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm">
                <span className="font-medium text-slate-900">Notify on payment failure</span>
                <br />
                <span className="text-slate-500">
                  Send internal alerts if payment cannot be matched or vending fails.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={!!watch('notify_on_critical_alert')}
                onChange={handleCheckboxChange('notify_on_critical_alert')}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm">
                <span className="font-medium text-slate-900">Notify on critical alerts</span>
                <br />
                <span className="text-slate-500">
                  Trigger internal notifications when a critical alert is raised.
                </span>
              </span>
            </label>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button type="submit" isLoading={isLoading} disabled={isLoading || !isDirty}>
            Save Changes
          </Button>
        </div>

        {/* Debug help (optional) */}
        {/* <pre className="text-xs">{JSON.stringify({ errors, isDirty }, null, 2)}</pre> */}
      </form>
    </div>
  )
}

export default SettingsPage
