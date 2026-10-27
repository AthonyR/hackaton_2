import { Link } from 'react-router'
import { sagasApi } from './api'
import { paletteStyle, sagaNumber, transitionName } from './model'
import { SagaError } from './SagaError'
import { useReducedMotion } from './useReducedMotion'
import { useSagaResource } from './useSagaResource'
import './sagas.css'

export function SagasPage() {
  const { resource, retry } = useSagaResource(sagasApi.list, 'sagas')
  const reduced = useReducedMotion()
  return (
    <section>
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sea">Poneglyph · Grand Line</p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">La historia del recorrido</h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-slate-600">Elige una saga y sigue a la tripulación, isla por isla, a través de su historia.</p>
      </header>
      {resource.status === 'loading' && <div className="min-h-80 rounded-2xl border border-slate-200 bg-white p-8" aria-busy="true"><p role="status">Consultando las sagas disponibles…</p></div>}
      {resource.status === 'error' && <SagaError error={resource.error} retry={retry} />}
      {resource.status === 'success' && resource.data.length === 0 && <div className="min-h-64 rounded-2xl border border-dashed border-slate-300 bg-white p-8"><h2 className="text-xl font-semibold">No hay sagas disponibles</h2><p className="mt-3 text-slate-600">Cuando el servidor tenga sagas para tu equipo, aparecerán aquí.</p><button type="button" onClick={retry} className="mt-5 rounded-lg border border-slate-300 px-4 py-2 text-sm">Volver a consultar</button></div>}
      {resource.status === 'success' && <ol className="space-y-6">{resource.data.map((saga) => (
        <li key={saga.id} style={paletteStyle(saga.palette)} className="saga-summary">
          <div className="saga-summary-order" aria-hidden="true">{String(saga.order).padStart(2, '0')}</div>
          <div className="min-w-0">
            <p className="saga-eyebrow">Saga {saga.order} · {saga.stageCount} etapas</p>
            <h2 className="mt-3 break-words text-2xl font-semibold sm:text-3xl" style={{ viewTransitionName: transitionName(saga.id) }}>{saga.title}</h2>
            <p className="mt-2 font-medium opacity-80">{saga.subtitle}</p>
            <p className="mt-5 max-w-3xl leading-relaxed opacity-85">{saga.synopsis}</p>
            <p className="mt-5 text-sm opacity-75">{saga.firstIsland} → {saga.lastIsland} · {sagaNumber(saga.totalDistanceNm)} mn</p>
            <Link to={`/sagas/${encodeURIComponent(saga.id)}`} state={{ sagaId: saga.id, sagaTitle: saga.title }} viewTransition={!reduced} className="saga-button mt-6 inline-flex">Recorrer {saga.title} →</Link>
          </div>
        </li>
      ))}</ol>}
    </section>
  )
}
