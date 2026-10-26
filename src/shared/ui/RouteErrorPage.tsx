export function RouteErrorPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16" role="alert">
      <h1 className="text-3xl font-semibold">No se pudo mostrar esta página</h1>
      <p className="mt-4 text-slate-600">Recarga la página para volver a intentarlo.</p>
      <button type="button" onClick={() => window.location.reload()} className="mt-6 rounded-lg bg-ink px-4 py-3 text-white">
        Reintentar
      </button>
    </main>
  )
}
