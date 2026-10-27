import { useEffect, useRef, useSyncExternalStore } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useFeedController } from './feed-context'
import { newsDate, newsPriorities, newsSearch, newsStatuses, newsTypes, parseNewsSearch, type NewsFilters } from './query'

const selectStyle = 'mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm'

export function NewsFeedPage({ filterKey, detailOpen }: { filterKey: string; detailOpen: boolean }) {
  const controller = useFeedController()
  const feed = useSyncExternalStore(controller.subscribe, controller.getSnapshot)
  const sentinel = useRef<HTMLDivElement>(null)
  const [, setParams] = useSearchParams()
  const filters = parseNewsSearch(filterKey)
  const hasError = Boolean(feed.error)

  useEffect(() => {
    if (detailOpen || feed.loading || hasError || !feed.loaded || !feed.hasMore || !sentinel.current) return
    const target = sentinel.current
    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void controller.loadNext()
      }, { rootMargin: '240px' })
      observer.observe(target)
      return () => observer.disconnect()
    }
    const check = () => { if (target.getBoundingClientRect().top <= window.innerHeight + 240) void controller.loadNext() }
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    check()
    return () => { window.removeEventListener('scroll', check); window.removeEventListener('resize', check) }
  }, [controller, detailOpen, feed.loading, feed.loaded, feed.hasMore, feed.items.length, hasError])

  function change(patch: Partial<NewsFilters>) {
    setParams((previous) => newsSearch({ ...parseNewsSearch(previous), ...patch }))
    window.scrollTo(0, 0)
  }

  return (
    <section>
      <header className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sea">Grand Line · Noticias del mundo</p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">News Coo</h1>
        <p className="mt-3 text-sm text-slate-600">Las noticias se cargan automáticamente al avanzar por el feed.</p>
      </header>
      <section aria-label="Filtros de noticias" className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-3">
        <label className="text-sm font-medium">Tipo<select value={filters.type} onChange={(event) => change({ type: event.target.value as NewsFilters['type'] })} className={selectStyle}><option value="">Todos los tipos</option>{Object.entries(newsTypes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="text-sm font-medium">Prioridad<select value={filters.priority} onChange={(event) => change({ priority: event.target.value as NewsFilters['priority'] })} className={selectStyle}><option value="">Todas las prioridades</option>{Object.entries(newsPriorities).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="text-sm font-medium">Estado<select value={filters.status} onChange={(event) => change({ status: event.target.value as NewsFilters['status'] })} className={selectStyle}><option value="">Todos los estados</option>{Object.entries(newsStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      </section>
      <div className="my-4 flex min-h-10 flex-wrap items-center justify-between gap-3 text-sm">
        <p aria-live="polite" className="text-slate-600">{feed.items.length} noticias cargadas</p>
        <button type="button" onClick={() => change({ type: '', priority: '', status: '' })} className="font-medium text-sea underline underline-offset-4">Limpiar filtros</button>
      </div>
      <p role="status" className="mb-3 min-h-6 text-sm text-sea">{feed.notice}</p>
      <ul className="space-y-5" aria-label="Noticias cargadas">
        {feed.items.map((item) => (
          <li key={item.id} className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="flex flex-wrap gap-2 text-xs font-medium"><span className="rounded-full bg-slate-100 px-3 py-1">{newsTypes[item.type]}</span><span className={`rounded-full px-3 py-1 ${item.priority === 'CRITICAL' ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-800'}`}>Prioridad {newsPriorities[item.priority].toLowerCase()}</span><span className="rounded-full bg-teal-50 px-3 py-1 text-teal-800">{newsStatuses[item.status]}</span></div>
            <h2 className="mt-4 break-words text-xl font-semibold sm:text-2xl"><Link to={`/news/${encodeURIComponent(item.id)}${filterKey ? `?${filterKey}` : ''}`} state={{ newsFeed: true, feedSearch: filterKey ? `?${filterKey}` : '' }} className="underline-offset-4 hover:underline">{item.title}</Link></h2>
            <p className="mt-3 leading-relaxed text-slate-600">{item.summary}</p>
            <p className="mt-5 text-xs text-slate-500">{item.source} · {item.island} · {newsDate(item.publishedAt)}</p>
          </li>
        ))}
      </ul>
      <div className="mt-6 min-h-44 rounded-2xl border border-slate-200 bg-white p-6" aria-live="polite">
        {feed.loading && <p role="status" className="text-sm text-slate-600">{feed.loaded ? 'Cargando más noticias…' : 'Cargando noticias…'}</p>}
        {feed.error && <div role="alert"><h2 className="font-semibold">{feed.error.kind === 'locked' ? 'Necesitan el Log Pose' : 'No se pudo continuar el feed'}</h2><p className="mt-3 text-sm text-slate-600">{feed.error.message}</p><div className="mt-4 flex flex-wrap gap-4"><button type="button" onClick={feed.error.kind === 'cursor' ? controller.reset : controller.retry} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold">{feed.error.kind === 'cursor' ? 'Reiniciar feed' : feed.error.kind === 'locked' ? 'Comprobar acceso' : 'Reintentar noticias'}</button>{feed.error.kind === 'locked' && <Link to="/dashboard" className="self-center text-sm font-medium text-sea underline">Ver estado e inspección CP3</Link>}</div></div>}
        {!feed.loading && !feed.error && feed.loaded && feed.items.length === 0 && <><h2 className="font-semibold">No hay noticias con estos filtros</h2><p className="mt-3 text-sm text-slate-600">Puedes cambiar el tipo, la prioridad o el estado.</p></>}
        {!feed.loading && !feed.error && feed.loaded && !feed.hasMore && <p className="mt-3 text-sm text-slate-500">Llegaste al final de las noticias.</p>}
        <div ref={sentinel} aria-hidden="true" className="h-1" />
      </div>
    </section>
  )
}
