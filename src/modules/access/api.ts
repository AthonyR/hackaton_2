import { apiRequest } from '../../shared/api/client'
import type { DashboardSummary, LoginRequest, LoginResponse, LogPose, MeResponse, RegisterRequest } from '../../shared/api/types'

export const accessApi = {
  login: (body: LoginRequest, signal?: AbortSignal) =>
    apiRequest<LoginResponse>('/auth/login', { method: 'POST', body, auth: false, signal }),
  register: (body: RegisterRequest, signal?: AbortSignal) =>
    apiRequest<LoginResponse>('/auth/register', { method: 'POST', body, auth: false, signal }),
  me: (signal: AbortSignal) => apiRequest<MeResponse>('/auth/me', { signal }),
  summary: (signal: AbortSignal) => apiRequest<DashboardSummary>('/dashboard/summary', { signal }),
  logPose: (signal: AbortSignal) => apiRequest<LogPose>('/log-pose', { signal }),
}
