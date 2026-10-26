import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <section>
      <p className="text-sm font-semibold text-sea">404</p>
      <h1 className="mt-3 text-3xl font-semibold">No encontramos esta página</h1>
      <Link to="/dashboard" className="mt-6 inline-block underline underline-offset-4">Volver al inicio</Link>
    </section>
  )
}
