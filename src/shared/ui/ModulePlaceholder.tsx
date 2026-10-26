type ModulePlaceholderProps = {
  title: string
  checkpoint: string
  owner: string
  description: string
}

/** Pantalla temporal de integración. Sustituir al implementar cada módulo. */
export function ModulePlaceholder({ title, checkpoint, owner, description }: ModulePlaceholderProps) {
  return (
    <section className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-10">
      <p className="text-sm font-semibold uppercase tracking-widest text-sea">{checkpoint}</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-5 leading-relaxed text-slate-600">{description}</p>
      <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
        <span className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-800">Pendiente de implementar</span>
        <span className="text-slate-500">Responsable propuesto: {owner}</span>
      </div>
    </section>
  )
}
