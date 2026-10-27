import type { NewsItem, NewsQuery } from '../../shared/api/types'

export const newsTypes = { BOUNTY_UPDATE: 'Recompensas', BATTLE: 'Batallas', MARINE_OPERATION: 'Operaciones de la Marina', WORLD_GOVERNMENT: 'Gobierno Mundial', DISCOVERY: 'Descubrimientos' } satisfies Record<NewsItem['type'], string>
export const newsPriorities = { LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta', CRITICAL: 'Crítica' } satisfies Record<NewsItem['priority'], string>
export const newsStatuses = { RUMOR: 'Rumor', CONFIRMED: 'Confirmada', DEBUNKED: 'Desmentida' } satisfies Record<NewsItem['status'], string>

export type NewsFilters = {
  type: NewsItem['type'] | ''
  priority: NewsItem['priority'] | ''
  status: NewsItem['status'] | ''
}

function option<T extends string>(value: string | null, options: Record<T, string>): T | '' {
  return value && Object.hasOwn(options, value) ? value as T : ''
}

export function parseNewsSearch(search: string | URLSearchParams): NewsFilters {
  const params = new URLSearchParams(search)
  return { type: option(params.get('type'), newsTypes), priority: option(params.get('priority'), newsPriorities), status: option(params.get('status'), newsStatuses) }
}

export function newsSearch(filters: NewsFilters): string {
  const params = new URLSearchParams()
  for (const key of ['type', 'priority', 'status'] as const) if (filters[key]) params.set(key, filters[key])
  return params.toString()
}

export function newsQuery(filters: NewsFilters, cursor: string | null): NewsQuery {
  return { limit: 20, cursor: cursor || undefined, type: filters.type || undefined, priority: filters.priority || undefined, status: filters.status || undefined }
}

export function matchesNews(item: NewsItem, filters: NewsFilters): boolean {
  return (!filters.type || item.type === filters.type) && (!filters.priority || item.priority === filters.priority) && (!filters.status || item.status === filters.status)
}

export function newsDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Fecha no disponible' : new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}
