import { useEffect, useState, type FormEvent } from 'react'

export function SearchInput({ value, onCommit }: { value: string; onCommit: (query: string) => void }) {
  const [draft, setDraft] = useState(value)
  const [previousValue, setPreviousValue] = useState(value)
  // Sin remontar el input: atrás/adelante sincroniza la URL y conserva el foco al buscar.
  if (previousValue !== value) {
    setPreviousValue(value)
    setDraft(value)
  }
  useEffect(() => {
    if (draft.trim() === value) return
    const timer = setTimeout(() => onCommit(draft.trim()), 400)
    return () => clearTimeout(timer)
  }, [draft, value, onCommit])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onCommit(draft.trim())
  }

  return (
    <form onSubmit={submit} className="sm:col-span-2">
      <label htmlFor="wanted-search" className="text-sm font-medium">Nombre o epíteto</label>
      <div className="mt-2 flex gap-2">
        <input id="wanted-search" type="search" maxLength={100} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Buscar en los carteles…" className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2" />
        <button type="submit" className="rounded-lg bg-sea px-4 py-2 text-sm font-semibold text-white">Buscar</button>
      </div>
    </form>
  )
}
