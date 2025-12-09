// ============================================
// FILE 2: src/hooks/useForm.js
// ============================================
import { useState, useCallback } from 'react'
import { useForm as useReactHookForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export const useForm = (schema, onSubmit, defaultValues = {}) => {
  const form = useReactHookForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const handleSubmit = useCallback(
    async (data) => {
      setIsSubmitting(true)
      setSubmitError(null)
      try {
        await onSubmit(data)
      } catch (error) {
        setSubmitError(error.message || 'An error occurred')
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSubmit]
  )

  return {
    ...form,
    isSubmitting,
    submitError,
    handleSubmit: form.handleSubmit(handleSubmit),
    reset: form.reset,
  }
}