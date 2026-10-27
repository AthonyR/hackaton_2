import { apiRequest } from '../../shared/api/client'
import type { Crew, WantedDetail, WantedPage } from '../../shared/api/types'
import { wantedQuery, type WantedFilters } from './query'

export const wantedApi = {
  crews: (signal: AbortSignal) => apiRequest<Crew[]>('/crews', { signal }),
  list: (filters: WantedFilters, signal: AbortSignal) => apiRequest<WantedPage>('/wanted', { query: wantedQuery(filters), signal }),
  detail: (id: string, signal: AbortSignal) => apiRequest<WantedDetail>(`/wanted/${encodeURIComponent(id)}`, { signal }),
}
