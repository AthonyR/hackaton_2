import { useCallback, useEffect, useState } from 'react'
import { getErrorMessage, isAbortError } from '../../shared/api/api-error'

type Resource<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: T }

/** Estado local sin caché; cada sección del dashboard se puede reintentar por separado. */
export function useAccessResource<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<{ attempt: number; load: typeof load; value: Resource<T> }>({ attempt: 0, load, value: { status: 'loading' } })
  const retry = useCallback(() => setAttempt((value) => value + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal).then((data) => {
      if (!controller.signal.aborted) setResult({ attempt, load, value: { status: 'success', data } })
    }).catch((error: unknown) => {
      if (!controller.signal.aborted && !isAbortError(error)) setResult({ attempt, load, value: { status: 'error', message: getErrorMessage(error) } })
    })
    return () => controller.abort()
  }, [load, attempt])

  const resource: Resource<T> = result.attempt === attempt && result.load === load ? result.value : { status: 'loading' }
  return { resource, retry }
}
