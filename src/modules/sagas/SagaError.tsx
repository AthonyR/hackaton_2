import { Link } from 'react-router'
import { ApiError, getErrorMessage } from '../../shared/api/api-error'

export function SagaError({ error, retry }: { error: unknown; retry: () => void }) {
  const locked = error instanceof ApiError && error.status === 423
  const missing = error instanceof ApiError && error.status === 404
  return (
    <section role="alert" className="min-h-64 rounded-2xl border border-slate-200 bg-white p-8">
      <h2 className="text-2xl font-semibold">{locked ? 'Necesitan el Log Pose' : missing ? 'Saga no encontrada' : 'No se pudo cargar la saga'}</h2>
      <p className="mt-4 max-w-2xl text-slate-600">{getErrorMessage(error)}</p>
      <div className="mt-6 flex flex-wrap items-center gap-5">
        <button type="button" onClick={retry} className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold">{locked ? 'Comprobar acceso' : 'Reintentar sagas'}</button>
        {locked && <Link to="/dashboard" className="text-sm font-medium text-sea underline">Ver estado del Log Pose e inspección CP3</Link>}
      </div>
    </section>
  )
}
