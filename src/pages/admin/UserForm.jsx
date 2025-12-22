// ============================================
// FILE: src/pages/admin/UserForm.jsx
// ============================================
import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { useUserStore, useClientStore } from '@/store'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Alert from '@/components/common/Alert'
import { ArrowLeft } from 'lucide-react'

const userSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().optional(),
  role: z.string().min(1, 'Role is required'),
  client: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
})

const UserForm = () => {
  const { id } = useParams()
  const isEdit = id && id !== 'new'
  const navigate = useNavigate()

  const { isLoading, error, getUser, createUser, updateUser, clearError } = useUserStore()
  const { clients, fetchClients } = useClientStore()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: '',
      first_name: '',
      last_name: '',
      phone: '',
      role: '',
      client: '',
      is_active: true,
      password: '',
    },
  })

  useEffect(() => {
    fetchClients()
    if (isEdit) {
      const load = async () => {
        const result = await getUser(id)
        if (result.success) {
          const u = result.data
          reset({
            email: u.email,
            first_name: u.first_name || '',
            last_name: u.last_name || '',
            phone: u.phone || '',
            role: u.role || '',
            client: u.client || '',
            is_active: !!u.is_active,
            password: '',
          })
        }
      }
      load()
    } else {
      reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit, getUser, reset, fetchClients])

  const onSubmit = async (values) => {
    const payload = { ...values }

    if (!isEdit && !payload.password) return
    if (isEdit && !payload.password) delete payload.password
    if (!payload.client) payload.client = null

    const result = isEdit ? await updateUser(id, payload) : await createUser(payload)
    if (result.success) navigate('/admin/users')
  }

  const handleCheckbox = (e) => setValue('is_active', e.target.checked, { shouldDirty: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/admin/users')}
          className="text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{isEdit ? 'Edit User' : 'Add User'}</h1>
          <p className="mt-1 text-slate-600">
            Create users under a Client (tenant). Clients (paybill owners) are created in Clients.
          </p>
        </div>
      </div>

      {error && <Alert type="error" title="Error" message={error} onClose={clearError} />}

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Email" placeholder="user@example.com" error={errors.email?.message} {...register('email')} />
            <Input label="Phone" placeholder="+2547..." error={errors.phone?.message} {...register('phone')} />
            <Input label="First Name" error={errors.first_name?.message} {...register('first_name')} />
            <Input label="Last Name" error={errors.last_name?.message} {...register('last_name')} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
              <select
                {...register('role')}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select role...</option>
                <option value="system_admin">System Admin</option>
                <option value="client_admin">Client Admin</option>
                <option value="operator">Operator</option>
                <option value="field_engineer">Field Engineer</option>
                <option value="read_only">Read Only Viewer</option>
              </select>
              {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Client (Tenant)</label>
              <select
                {...register('client')}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">No client (global)</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.paybill_number || 'no paybill'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label={isEdit ? 'New Password (optional)' : 'Password'}
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <label className="mt-6 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={watch('is_active')}
                onChange={handleCheckbox}
                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-slate-700">Active</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/users')}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} disabled={isLoading || !isDirty}>
              {isEdit ? 'Save Changes' : 'Create User'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default UserForm
