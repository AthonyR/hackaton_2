import { createContext } from 'react'
import type { LoginRequest, MeResponse, RegisterRequest, Team, User } from '../../shared/api/types'

export type SessionState =
  | { status: 'anonymous'; session: null; token: null; error: null }
  | { status: 'checking'; session: null; token: string; error: string | null }
  | { status: 'authenticated'; session: MeResponse; token: string; error: null }

export type AuthContextValue = {
  status: SessionState['status']
  user: User | null
  team: Team | null
  restoreError: string | null
  retrySession: () => void
  login: (input: LoginRequest, signal?: AbortSignal) => Promise<void>
  register: (input: RegisterRequest, signal?: AbortSignal) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
