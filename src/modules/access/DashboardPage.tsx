import { Link } from 'react-router'
import type { DashboardSummary } from '../../shared/api/types'
import { accessApi } from './api'
import { useAuth } from './useAuth'
import { useAccessResource } from './useAccessResource'

const integer = new Intl.NumberFormat('es-PE')
const dateTime = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' })
const panel = 'rounded-2xl border border-slate-200 bg-white p-6'

function formatDate(value: string) {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? 'Fecha no disponible' : dateTime.format(parsed)
}

function ResourceError({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5">
      <p className="text-sm text-red-800">{message}</p>
      <button type="button" onClick={retry} className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-800">Reintentar</button>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div aria-busy="true" className="min-h-80">
      <p role="status" className="mb-5 text-sm text-slate-600">Cargando indicadores de la tripulación…</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
        {['carteles', 'total', 'promedio', 'tripulaciones'].map((key) => <div key={key} className="h-28 rounded-xl border border-slate-200 bg-slate-100" />)}
      </div>
    </div>
  )
}

function SummaryContent({ summary }: { summary: DashboardSummary }) {
  const metrics = [
    { title: 'Carteles registrados', value: summary.wanted.total, unit: 'carteles' },
    { title: 'Recompensa total', value: summary.wanted.totalBounty, unit: 'berries' },
    { title: 'Recompensa promedio', value: summary.wanted.averageBounty, unit: 'berries' },
    { title: 'Tripulaciones piratas', value: summary.crews.total, unit: 'tripulaciones' },
  ]
  const statuses = [
    { name: 'Prófugos', value: summary.wanted.byStatus.AT_LARGE },
    { name: 'Capturados', value: summary.wanted.byStatus.CAPTURED },
    { name: 'Desaparecidos', value: summary.wanted.byStatus.MISSING },
  ]
  const fruits = [
    { name: 'Paramecia', value: summary.wanted.byFruit.PARAMECIA },
    { name: 'Zoan', value: summary.wanted.byFruit.ZOAN },
    { name: 'Logia', value: summary.wanted.byFruit.LOGIA },
    { name: 'Sin fruta', value: summary.wanted.byFruit.NONE },
  ]

  return (
    <>
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.title} className={panel}>
            <dt className="text-sm text-slate-600">{metric.title}</dt>
            <dd className="mt-3 break-words text-2xl font-semibold tabular-nums">{integer.format(metric.value)}<span className="mt-1 block text-xs font-normal text-slate-500">{metric.unit}</span></dd>
          </div>
        ))}
      </dl>

      {summary.wanted.total === 0 ? (
        <section className={`${panel} mt-6 border-dashed text-center`}>
          <h3 className="text-lg font-semibold">Tu workspace todavía no tiene carteles</h3>
          <p className="mt-2 text-sm text-slate-600">Cuando el servidor tenga datos para tu equipo, sus indicadores aparecerán aquí.</p>
        </section>
      ) : (
        <>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {[{ title: 'Estado de los carteles', items: statuses }, { title: 'Frutas del diablo', items: fruits }].map((group) => (
              <section key={group.title} className={panel}>
                <h3 className="font-semibold">{group.title}</h3>
                <dl className="mt-4 space-y-3">
                  {group.items.map(({ name, value }) => (
                    <div key={name} className="flex justify-between gap-4 text-sm"><dt className="text-slate-600">{name}</dt><dd className="font-semibold tabular-nums">{integer.format(value)}</dd></div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
          <section className={`${panel} mt-6`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold">Las mayores recompensas</h3>
              <Link to="/wanted" className="text-sm font-medium text-sea underline underline-offset-4">Ver carteles</Link>
            </div>
            {summary.topBounties.length === 0 ? <p className="mt-4 text-sm text-slate-600">No hay recompensas destacadas por ahora.</p> : (
              <ol className="mt-4 divide-y divide-slate-100">
                {summary.topBounties.map((wanted) => (
                  <li key={wanted.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                    <div className="min-w-0">
                      <Link to={`/wanted/${encodeURIComponent(wanted.id)}`} className="break-words font-medium text-sea underline-offset-4 hover:underline">{wanted.name}</Link>
                      <p className="mt-1 text-sm text-slate-500">{wanted.epithet} · {wanted.crew.name}</p>
                    </div>
                    <p className="text-sm font-semibold tabular-nums">{integer.format(wanted.bounty)} <span className="font-normal text-slate-500">berries</span></p>
                  </li>
                ))}
              </ol>
            )}
            {summary.crews.mostWanted && <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">Tripulación más buscada: <strong className="font-medium text-ink">{summary.crews.mostWanted.name}</strong> · {integer.format(summary.crews.mostWanted.totalBounty)} berries</p>}
          </section>
        </>
      )}
      <p className="mt-4 text-xs text-slate-500">Resumen del servidor: {formatDate(summary.generatedAt)}</p>
    </>
  )
}

export function DashboardPage() {
  const { team, user } = useAuth()
  const summary = useAccessResource(accessApi.summary)
  const logPose = useAccessResource(accessApi.logPose)

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sea">Consola de la tripulación</p>
          <h1 className="mt-3 break-words text-3xl font-semibold tracking-tight sm:text-4xl">{team?.name}</h1>
          <p className="mt-3 text-sm text-slate-600">Código de equipo: <strong className="font-semibold text-ink">{team?.code}</strong> · {user?.email}</p>
        </div>
        <button type="button" disabled={summary.resource.status === 'loading' || logPose.resource.status === 'loading'} onClick={() => { summary.retry(); logPose.retry() }} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium disabled:cursor-wait disabled:opacity-50">Actualizar datos</button>
      </header>

      <section aria-labelledby="log-pose-title" className={`${panel} min-h-44`}>
        <h2 id="log-pose-title" className="text-lg font-semibold">Estado del Log Pose</h2>
        {logPose.resource.status === 'loading' && <p role="status" className="mt-4 text-sm text-slate-600">Consultando el acceso al Grand Line…</p>}
        {logPose.resource.status === 'error' && <div className="mt-4"><ResourceError message={logPose.resource.message} retry={logPose.retry} /></div>}
        {logPose.resource.status === 'success' && (
          <div className="mt-4 flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-2xl">
              <p className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${logPose.resource.data.grandLineUnlocked ? 'bg-teal-50 text-teal-800' : 'bg-amber-50 text-amber-800'}`}>{logPose.resource.data.grandLineUnlocked ? 'Grand Line desbloqueado' : 'Inspección pendiente'}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{logPose.resource.data.message}</p>
              {logPose.resource.data.unlockedAt && <p className="mt-2 text-xs text-slate-500">Aprobado: {formatDate(logPose.resource.data.unlockedAt)}</p>}
            </div>
            {logPose.resource.data.grandLineUnlocked ? (
              <Link to="/sagas" className="rounded-lg bg-sea px-4 py-3 text-sm font-semibold text-white">Explorar sagas</Link>
            ) : (
              <a href="https://logpose-api-jg7f.onrender.com/reverse-mountain" target="_blank" rel="noreferrer" className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-medium">Cola de inspección CP3 ↗</a>
            )}
          </div>
        )}
      </section>

      <section aria-labelledby="summary-title">
        <h2 id="summary-title" className="mb-5 text-lg font-semibold">Panorama de recompensas</h2>
        {summary.resource.status === 'loading' && <DashboardSkeleton />}
        {summary.resource.status === 'error' && <ResourceError message={summary.resource.message} retry={summary.retry} />}
        {summary.resource.status === 'success' && <SummaryContent summary={summary.resource.data} />}
      </section>
    </div>
  )
}
