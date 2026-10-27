import type { WantedQuery, WantedStatus } from '../../shared/api/types'

export const wantedStatuses = { AT_LARGE: 'Prófugo', CAPTURED: 'Capturado', MISSING: 'Desaparecido' } satisfies Record<WantedStatus, string>
export const fruitTypes = { PARAMECIA: 'Paramecia', ZOAN: 'Zoan', LOGIA: 'Logia', NONE: 'Sin fruta' } as const
export const wantedSorts = { 'bounty,desc': 'Mayor recompensa', 'name,asc': 'Nombre A–Z', 'updatedAt,desc': 'Actualizados recientemente' } as const

export type WantedFilters = {
  page: number
  size: 10 | 20 | 50
  status: WantedStatus | ''
  crewId: string
  fruit: keyof typeof fruitTypes | ''
  q: string
  sort: keyof typeof wantedSorts
}

function option<T extends string>(value: string | null, allowed: Record<T, string>): T | '' {
  return value && Object.hasOwn(allowed, value) ? value as T : ''
}

export function parseWantedSearch(search: string | URLSearchParams): WantedFilters {
  const params = new URLSearchParams(search)
  const rawPage = params.get('page') ?? '0'
  const page = /^\d+$/.test(rawPage) ? Number(rawPage) : 0
  const size = Number(params.get('size') ?? 20)
  return {
    page: Number.isSafeInteger(page) && page >= 0 ? page : 0,
    size: size === 10 || size === 50 ? size : 20,
    status: option(params.get('status'), wantedStatuses),
    crewId: (params.get('crewId') ?? '').trim().slice(0, 200),
    fruit: option(params.get('fruit'), fruitTypes),
    q: (params.get('q') ?? '').trim().slice(0, 100),
    sort: option(params.get('sort'), wantedSorts) || 'bounty,desc',
  }
}

export function wantedSearch(filters: WantedFilters): string {
  const params = new URLSearchParams({ page: String(filters.page), size: String(filters.size), sort: filters.sort })
  for (const key of ['status', 'crewId', 'fruit', 'q'] as const) if (filters[key]) params.set(key, filters[key])
  return params.toString()
}

export function wantedQuery(filters: WantedFilters): WantedQuery {
  return {
    page: filters.page, size: filters.size, sort: filters.sort,
    status: filters.status || undefined, crewId: filters.crewId || undefined,
    fruit: filters.fruit || undefined, q: filters.q || undefined,
  }
}
