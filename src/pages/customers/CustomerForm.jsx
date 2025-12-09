// ============================================
// FILE: src/pages/customers/CustomerForm.jsx
// ============================================
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCustomerStore } from '@/store'
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import { useForm as useReactHookForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createCustomerSchema } from '@/utils/validators'

const CustomerForm = () => {
  const navigate = useNavigate()
  const { createCustomer, isLoading, error, clearError } = useCustomerStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useReactHookForm({
    resolver: zodResolver(createCustomerSchema),
  })

  const onSubmit = async (data) => {
    // Backend will fill client + customer_id
    const payload = {
      name: data.name,
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
    }

    clearError?.()

    const result = await createCustomer(payload)
    if (result.success) {
      navigate('/customers')
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Add New Customer</h1>

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Full Name"
            placeholder="e.g., John Doe"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Email"
            type="email"
            placeholder="e.g., doe@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Phone"
            placeholder="e.g., 0701 010 010"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Input
            label="Address"
            placeholder="e.g., Plot 10"
            error={errors.address?.message}
            {...register('address')}
          />

          <div className="flex gap-3">
            <Button
              type="submit"
              isLoading={isLoading}
            >
              Create Customer
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/customers')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default CustomerForm
