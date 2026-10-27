import { apiRequest } from '../../shared/api/client'
import type { SagaStory, SagaSummary } from '../../shared/api/types'

export const sagasApi = {
  list: (signal: AbortSignal) => apiRequest<SagaSummary[]>('/sagas', { signal }),
  story: (id: string, signal: AbortSignal) => apiRequest<SagaStory>(`/sagas/${encodeURIComponent(id)}/story`, { signal }),
}
