// ============================================
// FILE 4: src/hooks/useApi.js
// ============================================
import { useState, useCallback, useEffect } from 'react'

export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(
    async (...args) => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await apiFunction(...args)
        setData(result.data || result)
        return { success: true, data: result.data || result }
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'An error occurred'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setIsLoading(false)
      }
    },
    [apiFunction]
  )

  const refetch = useCallback(() => {
    execute()
  }, [execute])

  useEffect(() => {
    if (apiFunction && dependencies.length === 0) {
      execute()
    }
  }, [execute, apiFunction, dependencies])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
  }, [])

  return {
    data,
    isLoading,
    error,
    execute,
    refetch,
    reset,
  }
}

export default useApi