import { useCallback } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { isRecord } from '../../shared/api/api-error'
import { sagasApi } from './api'
import { transitionName } from './model'
import { SagaError } from './SagaError'
import { SagaExperience } from './SagaExperience'
import { useReducedMotion } from './useReducedMotion'
import { useSagaResource } from './useSagaResource'
import './sagas.css'

export function SagaStoryPage() {
  const { id = '' } = useParams()
  const location = useLocation()
  const load = useCallback((signal: AbortSignal) => sagasApi.story(id, signal), [id])
  const { resource, retry } = useSagaResource(load, id)
  const reduced = useReducedMotion()
  const state: unknown = location.state
  const pendingTitle = isRecord(state) && state.sagaId === id && typeof state.sagaTitle === 'string' ? state.sagaTitle : 'Historia de la saga'
  if (resource.status === 'success' && resource.data.stages.length > 0) return <SagaExperience key={resource.data.saga.id} story={resource.data} />
  return (
    <section>
      <Link to="/sagas" viewTransition={!reduced} className="mb-6 inline-block text-sm font-medium text-sea underline underline-offset-4">← Todas las sagas</Link>
      {resource.status === 'loading' && <div className="min-h-96 rounded-2xl border border-slate-200 bg-white p-8" aria-busy="true"><h1 style={{ viewTransitionName: transitionName(id) }} className="text-3xl font-semibold">{pendingTitle}</h1><p role="status" className="mt-5 text-slate-600">Consultando las etapas y el mapa de la saga…</p></div>}
      {resource.status === 'error' && <SagaError error={resource.error} retry={retry} />}
      {resource.status === 'success' && <div className="min-h-64 rounded-2xl border border-dashed border-slate-300 bg-white p-8"><h1 className="text-2xl font-semibold">{resource.data.saga.title}</h1><p className="mt-4 text-slate-600">Esta saga todavía no tiene etapas para recorrer.</p><button type="button" onClick={retry} className="mt-5 rounded-lg border border-slate-300 px-4 py-2 text-sm">Volver a consultar</button></div>}
    </section>
  )
}
