import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { Link, Outlet, useMatch, useSearchParams } from 'react-router'
import { ApiError, getErrorMessage } from '../../shared/api/api-error'
import { wantedApi } from './api'
import { berries, wantedDate } from './format'
import { fruitTypes, parseWantedSearch, wantedSearch, wantedStatuses, wantedSorts, type WantedFilters } from './query'
import { SearchInput } from './SearchInput'
import { useWantedResource } from './useWantedResource'

const selectStyle = 'mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm'

export function WantedModule() {
  const [params, setParams] = useSearchParams()
  const filters = parseWantedSearch(params)
  const key = wantedSearch(filters)
  const isDetail = Boolean(useMatch('/wanted/:id'))
  const listScroll = useRef<HTMLDivElement>(null)
  const windowScroll = useRef(0)
  const listOffset = useRef(0)
  const wasDetail = useRef(isDetail)
  const rawSearch = params.toString()
  const loadPage = useCallback((signal: AbortSignal) => wantedApi.list(parseWantedSearch(key), signal), [key])
  const page = useWantedResource(loadPage, key)
  const crews = useWantedResource(wantedApi.crews, 'crews')

  useEffect(() => {
    if (rawSearch !== key) setParams(key, { replace: true })
  }, [key, rawSearch, setParams])

  const change = useCallback((patch: Partial<WantedFilters>, replace = false) => {
    setParams((previous) => {
      const updated = { ...parseWantedSearch(previous), ...patch }
      if (!Object.hasOwn(patch, 'page')) updated.page = 0
      return wantedSearch(updated)
    }, { replace })
  }, [setParams])
  const search = useCallback((q: string) => change({ q }), [change])

  const data = page.resource.status === 'success' ? page.resource.data : null
  const outsideRange = data !== null && filters.page > 0 && filters.page >= data.totalPages
  useEffect(() => {
    if (outsideRange && data) change({ page: Math.max(0, data.totalPages - 1) }, true)
  }, [outsideRange, data, change])

  useLayoutEffect(() => {
    if (isDetail && !wasDetail.current) window.scrollTo(0, 0)
    if (!isDetail && wasDetail.current) {
      if (listScroll.current) listScroll.current.scrollTop = listOffset.current
      window.scrollTo(0, windowScroll.current)
    }
    wasDetail.current = isDetail
  }, [isDetail])
  useLayoutEffect(() => { listOffset.current = 0; listScroll.current?.scrollTo(0, 0) }, [key])

  const missingCrew = filters.crewId && crews.resource.status === 'success' && !crews.resource.data.some((crew) => crew.id === filters.crewId)
  const loading = page.resource.status === 'loading' || outsideRange

  return (
    <>
      <div hidden={isDetail}>
        <header className="mb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sea">East Blue · Carteles</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Se busca</h1>
          <p className="mt-3 text-sm text-slate-600">Consulta las recompensas de tu workspace y comparte la búsqueda con su URL.</p>
        </header>
        <section aria-label="Filtros de carteles" className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-4">
          <SearchInput value={filters.q} onCommit={search} />
          <label className="text-sm font-medium">Estado<select value={filters.status} onChange={(event) => change({ status: event.target.value as WantedFilters['status'] })} className={selectStyle}><option value="">Todos</option>{Object.entries(wantedStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="text-sm font-medium">Tripulación<select value={filters.crewId} onChange={(event) => change({ crewId: event.target.value })} className={selectStyle}><option value="">Todas las tripulaciones</option>{crews.resource.status === 'success' && crews.resource.data.map((crew) => <option key={crew.id} value={crew.id}>{crew.name}</option>)}{filters.crewId && (missingCrew || crews.resource.status !== 'success') && <option value={filters.crewId}>Tripulación: {filters.crewId}</option>}</select></label>
          <label className="text-sm font-medium">Fruta del diablo<select value={filters.fruit} onChange={(event) => change({ fruit: event.target.value as WantedFilters['fruit'] })} className={selectStyle}><option value="">Todas</option>{Object.entries(fruitTypes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="text-sm font-medium">Orden<select value={filters.sort} onChange={(event) => change({ sort: event.target.value as WantedFilters['sort'] })} className={selectStyle}>{Object.entries(wantedSorts).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="text-sm font-medium">Carteles por página<select value={filters.size} onChange={(event) => change({ size: Number(event.target.value) as WantedFilters['size'] })} className={selectStyle}>{[10, 20, 50].map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
          <button type="button" onClick={() => change({ ...parseWantedSearch(''), page: 0 })} className="self-end rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium">Limpiar filtros</button>
          {crews.resource.status === 'loading' && <p role="status" className="text-xs text-slate-500">Cargando tripulaciones…</p>}
          {crews.resource.status === 'error' && <p role="alert" className="text-sm text-red-700 sm:col-span-2">No se pudieron cargar las tripulaciones. <button type="button" onClick={crews.retry} className="underline">Reintentar tripulaciones</button></p>}
        </section>

        <div className="my-5 flex flex-wrap justify-between gap-3 text-sm" aria-live="polite">
          <p>{!loading && data ? `${new Intl.NumberFormat('es-PE').format(data.totalElements)} carteles encontrados` : page.resource.status === 'error' ? 'No se pudo consultar el total' : 'Consultando carteles…'}</p>
          <p className="text-slate-500">Página {filters.page + 1}{data && !outsideRange ? ` de ${Math.max(1, data.totalPages)}` : ''}</p>
        </div>
        <div ref={listScroll} tabIndex={0} role="region" aria-label="Resultados de carteles" aria-busy={loading} className="h-[min(65vh,42rem)] min-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5">
          {loading ? (
            <><p role="status" className="mb-4 text-sm text-slate-600">Cargando carteles…</p><div aria-hidden="true" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-64 rounded-xl bg-slate-100" />)}</div></>
          ) : page.resource.status === 'error' ? (
            <div role="alert" className="p-5 text-red-800"><h2 className="font-semibold">No se pudo cargar el listado</h2><p className="mt-2 text-sm">{getErrorMessage(page.resource.error)}</p>{page.resource.error instanceof ApiError && page.resource.error.details.map((detail) => <p key={detail.field} className="mt-2 text-sm">{detail.field}: {detail.message}</p>)}<button type="button" onClick={page.retry} className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium">Reintentar carteles</button></div>
          ) : data?.content.length === 0 ? (
            <div className="p-8 text-center"><h2 className="text-xl font-semibold">Sin resultados</h2><p className="mt-3 text-sm text-slate-600">Prueba con otro nombre o modifica los filtros.</p></div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data?.content.map((wanted) => (
                <li key={wanted.id} className="rounded-xl border border-stone-200 bg-amber-50/50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Wanted</p>
                  <h2 className="mt-4 break-words text-xl font-semibold"><Link to={`/wanted/${encodeURIComponent(wanted.id)}?${key}`} state={{ wantedList: true }} onClick={() => { windowScroll.current = window.scrollY; listOffset.current = listScroll.current?.scrollTop ?? 0 }} className="underline-offset-4 hover:underline">{wanted.name}</Link></h2>
                  <p className="mt-1 text-sm text-slate-600">{wanted.epithet}</p>
                  <p className="mt-4 break-words font-semibold">{berries(wanted.bounty)}</p>
                  <p className="mt-2 text-sm text-sea">{wantedStatuses[wanted.status]}</p>
                  <p className="mt-3 text-sm text-slate-600">{wanted.crew.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{wanted.devilFruit ? `${wanted.devilFruit.name} · ${fruitTypes[wanted.devilFruit.type]}` : 'Sin fruta del diablo'}</p>
                  <p className="mt-3 text-xs text-slate-500">Actualizado: {wantedDate(wanted.updatedAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <nav aria-label="Paginación de carteles" className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <button type="button" disabled={filters.page === 0} onClick={() => change({ page: Math.max(0, filters.page - 1) })} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm disabled:opacity-40">Anterior</button>
          <span className="text-sm text-slate-600">Página {filters.page + 1}</span>
          <button type="button" disabled={loading || !data || filters.page + 1 >= data.totalPages} onClick={() => change({ page: filters.page + 1 })} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm disabled:opacity-40">Siguiente</button>
        </nav>
      </div>
      <Outlet />
    </>
  )
}
