import { useCallback, useEffect, useState } from 'react'
import { isAbortError } from '../../shared/api/api-error'
import type { NewsDetail } from '../../shared/api/types'
import { newsApi } from './api'

type DetailState = { status: 'loading' } | { status: 'success'; data: NewsDetail } | { status: 'error'; error: unknown }

export function useNewsDetail(id: string) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<{ id: string; attempt: number; value: DetailState }>({ id, attempt, value: { status: 'loading' } })
  const retry = useCallback(() => setAttempt((value) => value + 1), [])
  useEffect(() => {
    const controller = new AbortController()
    void newsApi.detail(id, controller.signal).then((data) => {
      if (!controller.signal.aborted) setResult({ id, attempt, value: { status: 'success', data } })
    }).catch((error: unknown) => {
      if (!controller.signal.aborted && !isAbortError(error)) setResult({ id, attempt, value: { status: 'error', error } })
    })
    return () => controller.abort()
  }, [id, attempt])
  const resource: DetailState = result.id === id && result.attempt === attempt ? result.value : { status: 'loading' }
  return { resource, retry }
}
