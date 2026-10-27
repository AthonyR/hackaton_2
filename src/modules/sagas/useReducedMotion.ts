import { useCallback, useMemo, useSyncExternalStore } from 'react'

export function useReducedMotion(): boolean {
  const media = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)'), [])
  const subscribe = useCallback((listener: () => void) => {
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [media])
  const getSnapshot = useCallback(() => media.matches, [media])
  return useSyncExternalStore(subscribe, getSnapshot, () => true)
}
