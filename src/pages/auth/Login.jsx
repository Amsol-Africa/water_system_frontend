// ============================================
// FILE: src/pages/auth/Login.jsx
// ============================================
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Alert from '@/components/common/Alert'
import { loginSchema } from '@/utils/validators'
import { useForm as useReactHookForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const Login = () => {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuth()
  const [demoMode, setDemoMode] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useReactHookForm({
    resolver: zodResolver(loginSchema),
  })

  console.log('loginSchema:', loginSchema)


  const onSubmit = async (data) => {
    clearError()
    const result = await login(data.email, data.password)
    if (result.success) {
      navigate('/dashboard')
    }
  }

  const handleDemoLogin = async () => {
    clearError()
    const result = await login('admin@amsol.com', 'password123')
    if (result.success) {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg" />
            <span className="text-2xl font-bold text-white">Amsol Water Vending System</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-slate-600 mb-6">Sign in to your account to continue</p>

          {error && (
            <Alert
              type="error"
              message={error}
              onClose={clearError}
              className="mb-6"
            />
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="admin@amsol.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>
          

        </div>  

        {/* Footer */}
        <p className="text-center text-slate-400 text-sm mt-6">
          Amsol Water Vending System v1.0.0
        </p>
      </div>
    </div>
  )
}

export default Login
