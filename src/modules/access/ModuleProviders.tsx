import { useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react'
import { ApiError, getErrorMessage, isAbortError } from '../../shared/api/api-error'
import { tokenStore } from '../../shared/auth/token-store'
import type { LoginRequest, LoginResponse, RegisterRequest } from '../../shared/api/types'
import { accessApi } from './api'
import { AuthContext, type AuthContextValue, type SessionState } from './auth-context'

const anonymous: SessionState = { status: 'anonymous', session: null, token: null, error: null }

export function ModuleProviders({ children }: PropsWithChildren) {
  const [state, setState] = useState<SessionState>(() => {
    const token = tokenStore.get()
    return token ? { status: 'checking', session: null, token, error: null } : anonymous
  })
  const [retry, setRetry] = useState(0)
  const acceptedSession = useRef<SessionState | null>(null)
  const authAttempt = useRef(0)

  useEffect(() => {
    let controller: AbortController | null = null
    let revision = 0
    let disposed = false

    function syncSession() {
      const currentRevision = ++revision
      controller?.abort()
      const token = tokenStore.get()
      if (!token) {
        acceptedSession.current = null
        setState(anonymous)
        return
      }
      if (acceptedSession.current?.token === token) {
        setState(acceptedSession.current)
        return
      }

      acceptedSession.current = null
      setState({ status: 'checking', session: null, token, error: null })
      controller = new AbortController()
      const signal = controller.signal
      void accessApi.me(signal).then((session) => {
        if (disposed || signal.aborted || revision !== currentRevision || tokenStore.get() !== token) return
        const restored: SessionState = { status: 'authenticated', session, token, error: null }
        acceptedSession.current = restored
        setState(restored)
      }).catch((error: unknown) => {
        if (disposed || signal.aborted || isAbortError(error) || revision !== currentRevision || tokenStore.get() !== token) return
        if (error instanceof ApiError && error.status === 401) {
          tokenStore.clear()
          return
        }
        // Una falla de red no demuestra que el token sea inválido.
        setState({ status: 'checking', session: null, token, error: getErrorMessage(error) })
      })
    }

    const unsubscribe = tokenStore.subscribe(syncSession)
    syncSession()
    return () => {
      disposed = true
      controller?.abort()
      unsubscribe()
    }
  }, [retry])

  const logout = useCallback(() => {
    authAttempt.current += 1
    acceptedSession.current = null
    tokenStore.clear()
    setState(anonymous)
  }, [])

  useEffect(() => {
    if (state.status !== 'authenticated') return
    const expiresAt = Date.parse(state.session.expiresAt)
    if (!Number.isFinite(expiresAt)) return
    let timer: ReturnType<typeof setTimeout>
    function checkExpiry() {
      clearTimeout(timer)
      const remaining = expiresAt - Date.now()
      if (remaining <= 0) {
        if (tokenStore.get() === state.token) logout()
        return
      }
      timer = setTimeout(checkExpiry, Math.min(remaining, 2_147_483_647))
    }
    checkExpiry()
    window.addEventListener('focus', checkExpiry)
    document.addEventListener('visibilitychange', checkExpiry)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('focus', checkExpiry)
      document.removeEventListener('visibilitychange', checkExpiry)
    }
  }, [state, logout])

  const authenticate = useCallback(async (request: () => Promise<LoginResponse>, signal?: AbortSignal) => {
    const attempt = ++authAttempt.current
    const previousToken = tokenStore.get()
    const response = await request()
    if (signal?.aborted || attempt !== authAttempt.current || previousToken !== tokenStore.get()) {
      throw new DOMException('Solicitud de sesión descartada.', 'AbortError')
    }
    const authenticated: SessionState = {
      status: 'authenticated', token: response.token, error: null,
      session: { user: response.user, team: response.team, expiresAt: response.expiresAt },
    }
    acceptedSession.current = authenticated
    tokenStore.set(response.token)
    setState(authenticated)
  }, [])

  const login = useCallback((input: LoginRequest, signal?: AbortSignal) =>
    authenticate(() => accessApi.login(input, signal), signal), [authenticate])
  const register = useCallback((input: RegisterRequest, signal?: AbortSignal) =>
    authenticate(() => accessApi.register(input, signal), signal), [authenticate])
  const retrySession = useCallback(() => setRetry((value) => value + 1), [])

  const value = useMemo<AuthContextValue>(() => ({
    status: state.status,
    user: state.session?.user ?? null,
    team: state.session?.team ?? null,
    restoreError: state.error,
    retrySession, login, register, logout,
  }), [state, retrySession, login, register, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
