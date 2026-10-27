import { apiRequest } from '../../shared/api/client'
import type { NewsDetail, NewsFeed, NewsQuery, NewsStatusUpdate } from '../../shared/api/types'

export const newsApi = {
  feed: (query: NewsQuery, signal: AbortSignal) => apiRequest<NewsFeed>('/news/feed', { query, signal }),
  detail: (id: string, signal: AbortSignal) => apiRequest<NewsDetail>(`/news/${encodeURIComponent(id)}`, { signal }),
  verify: (id: string, body: NewsStatusUpdate, signal: AbortSignal) => apiRequest<NewsDetail>(`/news/${encodeURIComponent(id)}/status`, { method: 'PATCH', body, signal }),
}
