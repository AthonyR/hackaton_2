import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router'
import { getErrorMessage, isAbortError } from '../../shared/api/api-error'
import { getServerFieldErrors, validateAuth, type AuthErrors, type AuthField, type AuthFields } from './form-validation'
import { getReturnTo } from './return-to'
import { SessionStatus } from './SessionStatus'
import { useAuth } from './useAuth'

type AuthPageProps = { mode: 'login' | 'register' }
const inputStyle = 'mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-ink aria-invalid:border-red-600 disabled:bg-slate-100'

export function AuthPage({ mode }: AuthPageProps) {
  const registering = mode === 'register'
  const auth = useAuth()
  const location = useLocation()
  const [values, setValues] = useState<AuthFields>({ teamName: '', email: '', password: '' })
  const [errors, setErrors] = useState<AuthErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const controller = useRef<AbortController | null>(null)
  const inFlight = useRef(false)

  useEffect(() => () => { controller.current?.abort() }, [])

  function change(field: AuthField, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }))
    setErrors((previous) => ({ ...previous, [field]: undefined }))
    setError(null)
  }

  function focusFirstError(fields: AuthErrors) {
    const first = (['teamName', 'email', 'password'] as const).find((field) => fields[field])
    const element = first ? formRef.current?.elements.namedItem(first) : null
    if (element instanceof HTMLElement) element.focus()
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (inFlight.current) return
    const validation = validateAuth(values, registering)
    setErrors(validation)
    setError(null)
    if (Object.keys(validation).length) {
      focusFirstError(validation)
      return
    }

    inFlight.current = true
    setSubmitting(true)
    controller.current?.abort()
    const current = new AbortController()
    controller.current = current
    try {
      const credentials = { email: values.email.trim(), password: values.password }
      if (registering) await auth.register({ ...credentials, teamName: values.teamName.trim() }, current.signal)
      else await auth.login(credentials, current.signal)
    } catch (cause: unknown) {
      if (current.signal.aborted || isAbortError(cause)) return
      const fields = getServerFieldErrors(cause)
      setErrors(fields)
      setError(getErrorMessage(cause))
      // El fieldset vuelve a habilitarse antes de mover el foco al campo.
      requestAnimationFrame(() => { if (!current.signal.aborted) focusFirstError(fields) })
    } finally {
      inFlight.current = false
      if (!current.signal.aborted) setSubmitting(false)
    }
  }

  if (auth.status === 'checking') return <SessionStatus />
  if (auth.status === 'authenticated') return <Navigate to={getReturnTo(location.state as unknown)} replace />

  return (
    <section className="mx-auto grid max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-[0.85fr_1fr]">
      <div className="bg-ink p-8 text-white sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-200">Guild de Cazarrecompensas</p>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight">{registering ? 'Reúne a tu tripulación.' : 'El Grand Line te espera.'}</h1>
        <p className="mt-5 leading-relaxed text-slate-300">{registering
          ? 'Registra una cuenta para tu equipo. Los tres integrantes compartirán el acceso a su propio workspace.'
          : 'Accede al workspace de tu equipo para consultar sus carteles, noticias y sagas.'}</p>
        <p className="mt-10 border-t border-white/15 pt-6 text-sm text-slate-300">Log Pose Console · East Blue</p>
      </div>
      <div className="p-8 sm:p-10">
        <h2 className="text-2xl font-semibold">{registering ? 'Registrar tripulación' : 'Iniciar sesión'}</h2>
        <p className="mt-2 text-sm text-slate-600">{registering ? 'Tu código de equipo lo asignará el servidor.' : 'Usa el email y la contraseña de la tripulación.'}</p>
        <form ref={formRef} onSubmit={(event) => { void submit(event) }} noValidate className="mt-7" aria-busy={submitting}>
          <fieldset disabled={submitting} className="space-y-5">
            <legend className="sr-only">Datos de acceso</legend>
            {registering && (
              <div>
                <label htmlFor="teamName" className="text-sm font-medium">Nombre de la tripulación</label>
                <input id="teamName" name="teamName" value={values.teamName} onChange={(event) => change('teamName', event.target.value)} autoComplete="organization" required maxLength={40} aria-invalid={Boolean(errors.teamName)} aria-describedby={errors.teamName ? 'teamName-error' : undefined} className={inputStyle} />
                {errors.teamName && <p id="teamName-error" className="mt-2 text-sm text-red-700">{errors.teamName}</p>}
              </div>
            )}
            <div>
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <input id="email" name="email" type="email" value={values.email} onChange={(event) => change('email', event.target.value)} autoComplete="username" autoCapitalize="none" spellCheck={false} required maxLength={120} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} className={inputStyle} />
              {errors.email && <p id="email-error" className="mt-2 text-sm text-red-700">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium">Contraseña</label>
              <input id="password" name="password" type="password" value={values.password} onChange={(event) => change('password', event.target.value)} autoComplete={registering ? 'new-password' : 'current-password'} required maxLength={registering ? 72 : 120} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'password-error' : registering ? 'password-hint' : undefined} className={inputStyle} />
              {errors.password ? <p id="password-error" className="mt-2 text-sm text-red-700">{errors.password}</p> : registering && <p id="password-hint" className="mt-2 text-xs text-slate-500">Entre 8 y 72 caracteres.</p>}
            </div>
          </fieldset>
          {error && <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          <button type="submit" disabled={submitting} className="mt-6 w-full rounded-lg bg-sea px-4 py-3 font-semibold text-white hover:bg-ink disabled:cursor-wait disabled:opacity-60">
            {submitting ? (registering ? 'Registrando…' : 'Ingresando…') : (registering ? 'Crear cuenta y entrar' : 'Entrar a la consola')}
          </button>
          <p role="status" className="sr-only">{submitting ? 'Solicitud en curso. Espera un momento.' : ''}</p>
        </form>
        <p className="mt-6 text-sm text-slate-600">
          {registering ? '¿Ya tienen una cuenta? ' : '¿Primera vez aquí? '}
          <Link to={registering ? '/login' : '/register'} state={location.state as unknown} className="font-medium text-sea underline underline-offset-4">{registering ? 'Iniciar sesión' : 'Registrar tripulación'}</Link>
        </p>
      </div>
    </section>
  )
}
