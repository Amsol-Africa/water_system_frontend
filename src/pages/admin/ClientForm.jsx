import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Alert from '@/components/common/Alert'
import { ArrowLeft } from 'lucide-react'
import { useClientStore } from '@/store'

const clientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  paybill_number: z.string().min(1, 'Paybill number is required').max(20),
  company_info: z.string().optional().or(z.literal('')),

  stronpower_company_name: z.string().min(1, 'Stronpower company name is required'),
  stronpower_username: z.string().min(1, 'Stronpower username is required'),
  stronpower_password: z.string().min(1, 'Stronpower password is required'),

  is_active: z.boolean().default(true),
})

const ClientForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = id && id !== 'new'

  const {
    selectedClient,
    isLoading,
    error,
    getClient,
    createClient,
    updateClient,
    clearError,
  } = useClientStore()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      paybill_number: '',
      company_info: '',
      stronpower_company_name: '',
      stronpower_username: '',
      stronpower_password: '',
      is_active: true,
    },
  })

  useEffect(() => {
    if (isEdit) {
      const load = async () => {
        const result = await getClient(id)
        if (result.success) {
          const c = result.data
          reset({
            name: c.name || '',
            paybill_number: c.paybill_number || '',
            company_info: c.company_info || '',
            stronpower_company_name: c.stronpower_company_name || '',
            stronpower_username: c.stronpower_username || '',
            // password is write_only on backend; keep blank on edit unless you want to reset it
            stronpower_password: '',
            is_active: !!c.is_active,
          })
        }
      }
      load()
    } else {
      reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit, getClient, reset])

  const onSubmit = async (values) => {
    const payload = { ...values }

    // On edit: if password empty, don’t send it
    if (isEdit && !payload.stronpower_password) {
      delete payload.stronpower_password
    }

    const result = isEdit ? await updateClient(id, payload) : await createClient(payload)
    if (result.success) {
      navigate('/admin/clients')
    }
  }

  const handleActive = (e) => setValue('is_active', e.target.checked, { shouldDirty: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/admin/clients')}
          className="text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {isEdit ? 'Edit Client' : 'Add Client'}
          </h1>
          <p className="mt-1 text-slate-600">
            Paybill owner (tenant) + Stronpower credentials.
          </p>
        </div>
      </div>

      {error && (
        <Alert type="error" title="Error" message={error} onClose={clearError} />
      )}

      <Card className="max-w-3xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Client Name"
              placeholder="e.g., Bravo Water"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Paybill Number"
              placeholder="e.g., 123456"
              error={errors.paybill_number?.message}
              {...register('paybill_number')}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Company Info (optional)
            </label>
            <textarea
              {...register('company_info')}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder="Short notes about the client..."
            />
            {errors.company_info && (
              <p className="mt-1 text-xs text-red-600">{errors.company_info.message}</p>
            )}
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-slate-900">Stronpower Credentials</h2>
            <p className="mt-1 text-sm text-slate-600">
              These are used for vending tokens on behalf of this client.
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Input
                label="Company Name"
                placeholder="e.g., DicksonAbukal"
                error={errors.stronpower_company_name?.message}
                {...register('stronpower_company_name')}
              />
              <Input
                label="Username"
                placeholder="e.g., prepaid"
                error={errors.stronpower_username?.message}
                {...register('stronpower_username')}
              />
              <Input
                label={isEdit ? 'Password (leave blank to keep current)' : 'Password'}
                type="password"
                placeholder="••••••••"
                error={errors.stronpower_password?.message}
                {...register('stronpower_password')}
              />
              <label className="mt-6 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={watch('is_active')}
                  onChange={handleActive}
                  className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-slate-700">Active</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/clients')}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} disabled={isLoading || !isDirty}>
              {isEdit ? 'Save Changes' : 'Create Client'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default ClientForm
