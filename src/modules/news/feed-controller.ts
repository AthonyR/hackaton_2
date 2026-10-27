import { ApiError, getErrorMessage, isAbortError } from '../../shared/api/api-error'
import type { NewsDetail, NewsFeed, NewsItem, NewsQuery } from '../../shared/api/types'
import { matchesNews, newsQuery, type NewsFilters } from './query'

export type FeedFailure = { kind: 'network' | 'locked' | 'cursor'; message: string }
export type FeedSnapshot = {
  items: NewsItem[]
  loaded: boolean
  loading: boolean
  hasMore: boolean
  nextCursor: string | null
  error: FeedFailure | null
  notice: string | null
}
type FetchPage = (query: NewsQuery, signal: AbortSignal) => Promise<NewsFeed>
const initial = (): FeedSnapshot => ({ items: [], loaded: false, loading: false, hasMore: true, nextCursor: null, error: null, notice: null })

/** Estado de una sola visita al feed. No hay caché global ni persistencia de datos. */
export class FeedController {
  private snapshot: FeedSnapshot = initial()
  private readonly listeners = new Set<() => void>()
  private readonly verified = new Map<string, NewsDetail>()
  private readonly consumedCursors = new Set<string>()
  private active = false
  private revision = 0
  private inFlight = false
  private request: AbortController | null = null
  private readonly filters: NewsFilters
  private readonly fetchPage: FetchPage

  constructor(filters: NewsFilters, fetchPage: FetchPage) {
    this.filters = filters
    this.fetchPage = fetchPage
  }

  getSnapshot = (): FeedSnapshot => this.snapshot
  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  private publish(value: FeedSnapshot) {
    this.snapshot = value
    for (const listener of this.listeners) listener()
  }

  start = () => {
    this.active = true
    if (!this.snapshot.loaded && !this.snapshot.error) void this.loadNext()
  }

  stop = () => {
    this.active = false
    this.revision += 1
    this.request?.abort()
    this.inFlight = false
    if (this.snapshot.loading) this.publish({ ...this.snapshot, loading: false })
  }

  loadNext = async (retry = false): Promise<void> => {
    if (!this.active || this.inFlight || !this.snapshot.hasMore || (this.snapshot.error && !retry)) return
    this.inFlight = true
    const revision = ++this.revision
    const controller = new AbortController()
    this.request = controller
    const cursor = this.snapshot.nextCursor
    this.publish({ ...this.snapshot, loading: true, error: null })
    try {
      const page = await this.fetchPage(newsQuery(this.filters, cursor), controller.signal)
      if (!this.active || controller.signal.aborted || revision !== this.revision) return
      if (page.hasMore && (!page.nextCursor || page.nextCursor === cursor || this.consumedCursors.has(page.nextCursor))) {
        this.publish({ ...this.snapshot, loading: false, error: { kind: 'cursor', message: 'El servidor devolvió un cursor que no permite avanzar. Reinicia el feed.' } })
        return
      }
      if (cursor) this.consumedCursors.add(cursor)
      const items = [...this.snapshot.items]
      const ids = new Set(items.map((item) => item.id))
      for (const incoming of page.items) {
        const item = this.verified.get(incoming.id) ?? incoming
        if (!ids.has(item.id) && matchesNews(item, this.filters)) {
          items.push(item)
          ids.add(item.id)
        }
      }
      this.publish({ ...this.snapshot, items, loaded: true, loading: false, hasMore: page.hasMore, nextCursor: page.hasMore ? page.nextCursor : null, error: null })
    } catch (error: unknown) {
      if (!this.active || controller.signal.aborted || isAbortError(error) || revision !== this.revision) return
      const kind = error instanceof ApiError && error.status === 423 ? 'locked'
        : error instanceof ApiError && ['INVALID_CURSOR', 'CURSOR_FILTER_MISMATCH'].includes(error.code) ? 'cursor' : 'network'
      this.publish({ ...this.snapshot, loading: false, error: { kind, message: getErrorMessage(error) } })
    } finally {
      if (revision === this.revision) this.inFlight = false
    }
  }

  retry = () => { void this.loadNext(true) }

  reset = () => {
    this.stop()
    this.consumedCursors.clear()
    this.verified.clear()
    this.publish(initial())
    this.start()
  }

  updateItem = (detail: NewsDetail, announce = false) => {
    if (!this.active) return
    this.verified.set(detail.id, detail)
    const items = this.snapshot.items.flatMap((item) => item.id !== detail.id ? [item] : matchesNews(detail, this.filters) ? [detail] : [])
    this.publish({ ...this.snapshot, items, notice: announce ? 'Noticia verificada. El feed ya refleja el nuevo estado.' : this.snapshot.notice })
  }
}
