import { useCallback } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { ApiError, getErrorMessage, isRecord } from '../../shared/api/api-error'
import { wantedApi } from './api'
import { berries, wantedDate, wantedRole } from './format'
import { wantedStatuses } from './query'
import { useWantedResource } from './useWantedResource'

export function WantedDetailPage() {
  const { id = '' } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const load = useCallback((signal: AbortSignal) => wantedApi.detail(id, signal), [id])
  const { resource, retry } = useWantedResource(load, id)
  const state: unknown = location.state
  const fromList = isRecord(state) && state.wantedList === true
  const back = `/wanted${location.search}`

  return (
    <article className="mx-auto max-w-4xl">
      {fromList ? <button type="button" onClick={() => { void navigate(-1) }} className="mb-6 text-sm font-medium text-sea underline underline-offset-4">← Volver a los carteles</button> : <Link to={back} replace className="mb-6 inline-block text-sm font-medium text-sea underline underline-offset-4">← Ver carteles</Link>}
      <div className="min-h-96 rounded-2xl border border-slate-200 bg-white p-6 sm:p-9">
        {resource.status === 'loading' && <p role="status">Cargando el cartel…</p>}
        {resource.status === 'error' && <div role="alert"><h1 className="text-2xl font-semibold">{resource.error instanceof ApiError && resource.error.status === 404 ? 'Cartel no encontrado' : 'No se pudo cargar el cartel'}</h1><p className="mt-4 text-slate-600">{getErrorMessage(resource.error)}</p><button type="button" onClick={retry} className="mt-5 rounded-lg border border-slate-300 px-4 py-2">Reintentar</button></div>}
        {resource.status === 'success' && (() => {
          const wanted = resource.data
          return <>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sea">Se busca · {wantedStatuses[wanted.status]}</p>
            <h1 className="mt-4 break-words text-4xl font-semibold">{wanted.name}</h1>
            <p className="mt-2 text-xl text-slate-500">{wanted.epithet}</p>
            <p className="mt-6 text-2xl font-semibold">{berries(wanted.bounty)}</p>
            <p className="mt-6 whitespace-pre-line leading-relaxed text-slate-700">{wanted.bio}</p>
            <dl className="mt-8 grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-2">
              {[['Tripulación', wanted.crew.name], ['Puesto', wantedRole(wanted.role)], ['Fruta del diablo', wanted.devilFruit?.name ?? 'Sin fruta'], ['Amenaza', `${wanted.threatLevel} de 5`], ['Edad', `${wanted.age} años`], ['Altura', `${wanted.heightCm} cm`], ['Último avistamiento', `${wanted.lastSeen.island} · ${wantedDate(wanted.lastSeen.seenAt)}`], ['Actualizado', wantedDate(wanted.updatedAt)]].map(([label, value]) => <div key={label}><dt className="text-sm text-slate-500">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div>)}
            </dl>
            <section className="mt-8"><h2 className="text-lg font-semibold">Historial de recompensas</h2>{wanted.bountyHistory.length ? <ol className="mt-4 space-y-3">{wanted.bountyHistory.map((entry, index) => <li key={`${entry.issuedAt}-${index}`} className="flex flex-wrap justify-between gap-2 rounded-lg bg-paper p-3 text-sm"><span>{wantedDate(entry.issuedAt)}</span><strong>{berries(entry.amount)}</strong></li>)}</ol> : <p className="mt-3 text-sm text-slate-600">Sin historial disponible.</p>}</section>
          </>
        })()}
      </div>
    </article>
  )
}
