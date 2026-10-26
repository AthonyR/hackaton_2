import { tokenStore } from '../auth/token-store'
import { env } from '../config/env'
import { ApiError } from './api-error'

type QueryValue = string | number | boolean | null | undefined

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  query?: Record<string, QueryValue>
  body?: unknown
  auth?: boolean
  signal?: AbortSignal
}

/**
 * path relativo a VITE_API_BASE_URL: '/wanted', nunca '/api/v1/wanted'.
 * T proviene del contrato generado; no hay validación runtime del cuerpo exitoso.
 * Sin caché ni reintentos automáticos. Cada módulo gestiona su estado y concurrencia.
 */
export async function apiRequest<T>(path: `/${string}`, options: RequestOptions = {}): Promise<T> {
  const url = new URL(`${env.apiBaseUrl}${path}`)
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value))
  }

  const requestToken = options.auth === false ? null : tokenStore.get()
  const headers = new Headers({ Accept: 'application/json' })
  if (requestToken) headers.set('Authorization', `Bearer ${requestToken}`)
  if (options.body !== undefined) headers.set('Content-Type', 'application/json')

  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
    cache: 'no-store',
    credentials: 'omit',
  })

  // Una respuesta vieja no debe cerrar una sesión iniciada con otro token.
  if (response.status === 401 && requestToken && tokenStore.get() === requestToken) tokenStore.clear()

  const text = await response.text()
  let payload: unknown = undefined
  if (text) {
    try {
      payload = JSON.parse(text) as unknown
    } catch {
      if (response.ok) throw new Error('La API devolvió una respuesta que no es JSON.')
    }
  }

  if (!response.ok) throw new ApiError(response, payload)
  return payload as T
}
