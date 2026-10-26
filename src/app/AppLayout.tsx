import { NavLink, Outlet } from 'react-router'
import { useAuth } from '../modules/access/useAuth'

const links = [
  { to: '/dashboard', label: 'Inicio' },
  { to: '/wanted', label: 'Se busca' },
  { to: '/news', label: 'Noticias' },
  { to: '/sagas', label: 'Sagas' },
]

export function AppLayout() {
  const { status, team, logout } = useAuth()
  return (
    <div className="min-h-screen">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:block focus:p-3">
        Saltar al contenido
      </a>
      <header className="border-b border-white/15 bg-ink text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5 px-6 py-5">
          <NavLink to="/" className="font-semibold tracking-wide">Log Pose Console</NavLink>
          <nav aria-label="Navegación principal" className="flex flex-wrap gap-2">
            {status === 'authenticated' && links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-white/15 text-white' : 'text-slate-300 hover:bg-white/10'}`
                }
              >
                {label}
              </NavLink>
            ))}
            {status === 'authenticated' ? (
              <button type="button" onClick={logout} className="rounded-lg border border-white/25 px-3 py-2 text-sm hover:bg-white/10" aria-label={`Cerrar sesión de ${team?.name ?? 'la tripulación'}`}>Cerrar sesión</button>
            ) : status === 'anonymous' ? (
              <>
                <NavLink to="/login" className="rounded-lg px-3 py-2 text-sm hover:bg-white/10">Iniciar sesión</NavLink>
                <NavLink to="/register" className="rounded-lg bg-white/15 px-3 py-2 text-sm hover:bg-white/20">Registrar tripulación</NavLink>
              </>
            ) : <span className="px-3 py-2 text-sm text-slate-300">Verificando sesión…</span>}
          </nav>
        </div>
      </header>
      <main id="contenido" tabIndex={-1} className="mx-auto max-w-6xl px-6 py-12">
        <Outlet />
      </main>
    </div>
  )
}
