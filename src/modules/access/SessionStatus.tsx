import { useAuth } from './useAuth'

export function SessionStatus() {
  const { restoreError, retrySession, logout } = useAuth()
  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8" aria-busy={!restoreError}>
      <h1 className="text-2xl font-semibold">{restoreError ? 'No pudimos verificar tu sesión' : 'Verificando tu sesión…'}</h1>
      {restoreError ? (
        <>
          <p className="mt-4 text-slate-600" role="alert">{restoreError}</p>
          <div className="mt-6 flex flex-wrap gap-4">
            <button type="button" onClick={retrySession} className="rounded-lg bg-ink px-4 py-3 text-white">Reintentar sesión</button>
            <button type="button" onClick={logout} className="rounded-lg border border-slate-300 px-4 py-3">Ir al acceso</button>
          </div>
        </>
      ) : <p role="status" className="mt-4 text-slate-600">Estamos comprobando el acceso de tu tripulación.</p>}
    </section>
  )
}
