// src/pages/meters/MeterForm.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useMeterStore } from '@/store'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Alert from '@/components/common/Alert'
import { createMeterSchema } from '@/utils/validators'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const MeterForm = () => {
  const navigate = useNavigate()
  const { createMeter, isLoading, error, clearError } = useMeterStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createMeterSchema),
  })

  const onSubmit = async (data) => {
    clearError?.()
    const result = await createMeter(data)
    if (result.success) {
      navigate('/meters')
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Add New Meter</h1>

      <Card className="max-w-2xl">
        {error && (
          <Alert
            type="error"
            message={error}
            className="mb-4"
            onClose={clearError}
          />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Meter ID"
            placeholder="e.g., 58000185726"
            error={errors.meter_id?.message}
            {...register('meter_id')}
          />

          <Input
            label="Meter Type"
            placeholder="e.g., Water Meter"
            error={errors.meter_type?.message}
            {...register('meter_type')}
          />

          <Input
            label="Location"
            placeholder="e.g., Plot 10"
            error={errors.location?.message}
            {...register('location')}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Status
            </label>
            <select
              {...register('status')}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              defaultValue="active"
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="maintenance">Maintenance</option>
              <option value="fault">Fault</option>
              <option value="offline">Offline</option>
              <option value="tamper">Tamper</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-xs text-red-500">
                {errors.status.message}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button type="submit" isLoading={isLoading}>
              Create Meter
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/meters')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default MeterForm
