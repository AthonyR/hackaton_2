import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { ApiError, getErrorMessage } from '../../shared/api/api-error'
import type { NewsDetail, NewsStatusUpdate } from '../../shared/api/types'
import { newsApi } from './api'
import { currentNews } from './current-news'
import { useFeedController } from './feed-context'
import { newsDate, newsPriorities, newsStatuses, newsTypes } from './query'

export function NewsArticle({ initial, onBusyChange }: { initial: NewsDetail; onBusyChange: (value: boolean) => void }) {
  const [detail, setDetail] = useState(initial)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const alive = useRef(true)
  const inFlight = useRef(false)
  const feed = useFeedController()
  useEffect(() => {
    alive.current = true
    return () => { alive.current = false }
  }, [])

  async function verify(status: NewsStatusUpdate['status']) {
    if (inFlight.current || detail.status !== 'RUMOR') return
    inFlight.current = true
    setPending(true)
    onBusyChange(true)
    setError(null)
    setMessage(null)
    const controller = new AbortController()
    try {
      const updated = await newsApi.verify(detail.id, { status }, controller.signal)
      // Si se cierra con el historial, el resultado aún actualiza el feed montado.
      feed.updateItem(updated, true)
      if (!alive.current) return
      setDetail(updated)
      setMessage(updated.status === 'CONFIRMED' ? 'Noticia confirmada correctamente.' : 'Noticia desmentida correctamente.')
    } catch (cause: unknown) {
      if (!alive.current) return
      if (cause instanceof ApiError && cause.code === 'NEWS_ALREADY_VERIFIED') {
        const current = currentNews(cause.current, detail)
        if (current) {
          setDetail(current)
          feed.updateItem(current)
          setError(`La noticia ya fue verificada. Estado actual: ${newsStatuses[current.status].toLowerCase()}.`)
        } else setError(`${cause.message} Cierra y vuelve a abrir el detalle para consultar su estado actual.`)
      } else setError(`${getErrorMessage(cause)} Puedes volver a intentarlo.`)
    } finally {
      inFlight.current = false
      if (alive.current) {
        setPending(false)
        onBusyChange(false)
      }
    }
  }

  return (
    <article aria-busy={pending}>
      <div className="flex flex-wrap gap-2 text-xs font-medium"><span className="rounded-full bg-slate-100 px-3 py-1">{newsTypes[detail.type]}</span><span className="rounded-full bg-amber-50 px-3 py-1 text-amber-800">Prioridad {newsPriorities[detail.priority].toLowerCase()}</span><span className="rounded-full bg-teal-50 px-3 py-1 text-teal-800">{newsStatuses[detail.status]}</span></div>
      <h1 id="news-detail-title" className="mt-5 break-words text-2xl font-semibold sm:text-3xl">{detail.title}</h1>
      <p className="mt-4 text-sm text-slate-500">{detail.source} · {detail.island} · {newsDate(detail.publishedAt)}</p>
      <p className="mt-6 text-lg leading-relaxed text-slate-600">{detail.summary}</p>
      <div className="mt-6 space-y-4 leading-relaxed text-slate-700">{detail.body.map((paragraph, index) => <p key={index} className="whitespace-pre-line">{paragraph}</p>)}</div>
      {detail.relatedWanted && <p className="mt-6 text-sm"><Link to={`/wanted/${encodeURIComponent(detail.relatedWanted.id)}`} className="font-medium text-sea underline underline-offset-4">Cartel relacionado: {detail.relatedWanted.name}</Link></p>}
      <section className="mt-8 border-t border-slate-200 pt-6" aria-label="Verificación de la noticia">
        <h2 className="font-semibold">Verificación</h2>
        {detail.status === 'RUMOR' ? <><p className="mt-2 text-sm text-slate-600">Verifica este rumor como confirmado o desmentido.</p><div className="mt-4 flex flex-wrap gap-3"><button type="button" disabled={pending} onClick={() => { void verify('CONFIRMED') }} className="rounded-lg bg-sea px-4 py-3 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-50">Confirmar noticia</button><button type="button" disabled={pending} onClick={() => { void verify('DEBUNKED') }} className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold disabled:cursor-wait disabled:opacity-50">Desmentir noticia</button></div></> : <p className="mt-3 text-sm text-slate-600">Esta noticia está {newsStatuses[detail.status].toLowerCase()}.{detail.verifiedAt ? ` Verificada: ${newsDate(detail.verifiedAt)}.` : ''}</p>}
        {pending && <p role="status" className="mt-4 text-sm text-slate-600">Guardando verificación…</p>}
        {message && <p role="status" className="mt-4 rounded-lg bg-teal-50 p-3 text-sm text-teal-800">{message}</p>}
        {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      </section>
    </article>
  )
}
