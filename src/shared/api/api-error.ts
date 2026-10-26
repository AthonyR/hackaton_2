export type FieldError = { field: string; message: string }

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFieldError(value: unknown): value is FieldError {
  return isRecord(value) && typeof value.field === 'string' && typeof value.message === 'string'
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly traceId: string | undefined
  readonly details: FieldError[]
  readonly retryAfterSeconds: number | undefined
  readonly current: unknown

  constructor(response: Response, payload: unknown) {
    const body = isRecord(payload) ? payload : {}
    super(typeof body.message === 'string' ? body.message : `La API respondió con un error (${response.status}).`)
    this.name = 'ApiError'
    this.status = response.status
    this.code = typeof body.code === 'string' ? body.code : 'HTTP_ERROR'
    this.traceId = typeof body.traceId === 'string' ? body.traceId : response.headers.get('X-Trace-Id') ?? undefined
    this.details = Array.isArray(body.details) ? body.details.filter(isFieldError) : []
    const retryAfter = response.headers.get('Retry-After')
    const retrySeconds = retryAfter === null ? undefined : Number(retryAfter)
    this.retryAfterSeconds = typeof body.retryAfterSeconds === 'number'
      ? body.retryAfterSeconds
      : retrySeconds !== undefined && Number.isFinite(retrySeconds) ? retrySeconds : undefined
    this.current = body.current
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return 'No se pudo completar la solicitud. Revisa tu conexión y vuelve a intentarlo.'
}
