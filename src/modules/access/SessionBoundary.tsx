import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './useAuth'
import { SessionStatus } from './SessionStatus'

export function SessionBoundary() {
  const { status, team } = useAuth()
  const location = useLocation()
  if (status === 'checking') return <SessionStatus />
  if (status === 'anonymous') {
    const from = `${location.pathname}${location.search}${location.hash}`
    return <Navigate to="/login" replace state={{ from }} />
  }
  return <Outlet key={team?.code} />
}
