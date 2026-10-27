import { useCallback, useEffect, useState } from 'react'
import { isAbortError } from '../../shared/api/api-error'

type Resource<T> = { status: 'loading' } | { status: 'success'; data: T } | { status: 'error'; error: unknown }

export function useWantedResource<T>(load: (signal: AbortSignal) => Promise<T>, key: string) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<{ key: string; attempt: number; value: Resource<T> }>({ key, attempt, value: { status: 'loading' } })
  const retry = useCallback(() => setAttempt((value) => value + 1), [])
  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal).then((data) => {
      if (!controller.signal.aborted) setResult({ key, attempt, value: { status: 'success', data } })
    }).catch((error: unknown) => {
      if (!controller.signal.aborted && !isAbortError(error)) setResult({ key, attempt, value: { status: 'error', error } })
    })
    return () => controller.abort()
  }, [load, key, attempt])
  const resource: Resource<T> = result.key === key && result.attempt === attempt ? result.value : { status: 'loading' }
  return { resource, retry }
}
