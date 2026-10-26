import { useContext } from 'react'
import { AuthContext } from './auth-context'

export function useAuth() {
  const auth = useContext(AuthContext)
  if (!auth) throw new Error('useAuth debe usarse dentro de ModuleProviders.')
  return auth
}
