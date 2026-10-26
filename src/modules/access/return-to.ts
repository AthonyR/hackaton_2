import { isRecord } from '../../shared/api/api-error'

/** Acepta únicamente destinos internos y evita regresar al propio formulario. */
export function getReturnTo(state: unknown): string {
  if (!isRecord(state) || typeof state.from !== 'string') return '/dashboard'
  const from = state.from
  if (!from.startsWith('/') || from.startsWith('//') || from.includes('\\')) return '/dashboard'
  const url = new URL(from, 'https://logpose.invalid')
  if (url.origin !== 'https://logpose.invalid' || ['/login', '/register'].includes(url.pathname.replace(/\/+$/, ''))) return '/dashboard'
  return `${url.pathname}${url.search}${url.hash}`
}
