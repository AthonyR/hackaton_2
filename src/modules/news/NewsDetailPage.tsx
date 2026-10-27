import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { ApiError, getErrorMessage, isRecord } from '../../shared/api/api-error'
import { NewsArticle } from './NewsArticle'
import { useNewsDetail } from './useNewsDetail'

export function NewsDetailPage() {
  const { id = '' } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const dialog = useRef<HTMLDialogElement>(null)
  const [busy, setBusy] = useState(false)
  const { resource, retry } = useNewsDetail(id)
  const state: unknown = location.state
  const fromFeed = isRecord(state) && state.newsFeed === true && state.feedSearch === location.search
  const close = useCallback(() => {
    if (busy) return
    if (fromFeed) void navigate(-1)
    else void navigate({ pathname: '/news', search: location.search }, { replace: true })
  }, [busy, fromFeed, navigate, location.search])

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const scrollY = window.scrollY
    const oldOverflow = document.body.style.overflow
    const oldPadding = document.body.style.paddingRight
    const scrollbar = Math.max(0, window.innerWidth - document.documentElement.clientWidth)
    document.body.style.overflow = 'hidden'
    if (scrollbar) document.body.style.paddingRight = `${scrollbar}px`
    element.showModal()
    return () => {
      element.close()
      document.body.style.overflow = oldOverflow
      document.body.style.paddingRight = oldPadding
      window.scrollTo(0, scrollY)
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
    }
  }, [])

  return (
    <dialog ref={dialog} aria-labelledby={resource.status === 'success' ? 'news-detail-title' : 'news-dialog-title'} onCancel={(event) => { event.preventDefault(); close() }} onClick={(event) => { if (event.target === event.currentTarget) close() }} className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 text-ink shadow-xl backdrop:bg-ink/60">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
        <p className="text-sm font-semibold text-sea">News Coo · Detalle</p>
        <button type="button" disabled={busy} onClick={close} autoFocus className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-50">Cerrar noticia</button>
      </div>
      <div className="min-h-64 p-6 sm:p-8">
        {resource.status === 'loading' && <><h1 id="news-dialog-title" className="sr-only">Detalle de la noticia</h1><p role="status">Cargando noticia…</p></>}
        {resource.status === 'error' && <div role="alert"><h1 id="news-dialog-title" className="text-2xl font-semibold">{resource.error instanceof ApiError && resource.error.status === 423 ? 'Necesitan el Log Pose' : resource.error instanceof ApiError && resource.error.status === 404 ? 'Noticia no encontrada' : 'No se pudo cargar la noticia'}</h1><p className="mt-4 text-sm text-slate-600">{getErrorMessage(resource.error)}</p><button type="button" onClick={retry} className="mt-5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold">Reintentar detalle</button>{resource.error instanceof ApiError && resource.error.status === 423 && <Link to="/dashboard" className="ml-4 text-sm text-sea underline">Ver estado del Log Pose</Link>}</div>}
        {resource.status === 'success' && <NewsArticle key={resource.data.id} initial={resource.data} onBusyChange={setBusy} />}
      </div>
    </dialog>
  )
}
