import { isRecord } from '../../shared/api/api-error'
import type { NewsDetail } from '../../shared/api/types'
import { newsStatuses } from './query'

/** El PATCH solo modifica estado y fechas; conserva la narrativa que ya fue cargada. */
export function currentNews(value: unknown, previous: NewsDetail): NewsDetail | null {
  if (!isRecord(value) || value.id !== previous.id || typeof value.status !== 'string' || !Object.hasOwn(newsStatuses, value.status)
    || typeof value.updatedAt !== 'string' || !(value.verifiedAt === null || typeof value.verifiedAt === 'string')) return null
  return { ...previous, status: value.status as NewsDetail['status'], updatedAt: value.updatedAt, verifiedAt: value.verifiedAt }
}
