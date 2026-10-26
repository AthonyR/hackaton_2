const STORAGE_KEY = 'logpose.token'
const listeners = new Set<() => void>()

function readStoredToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

let token = readStoredToken()

function notify() {
  for (const listener of listeners) listener()
}

function setToken(value: string | null) {
  token = value
  try {
    if (value) localStorage.setItem(STORAGE_KEY, value)
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Si el navegador impide persistir, la sesión sigue disponible en memoria.
  }
  notify()
}

window.addEventListener('storage', (event: StorageEvent) => {
  if (event.storageArea === localStorage && (event.key === STORAGE_KEY || event.key === null)) {
    token = readStoredToken()
    notify()
  }
})

/** Solo almacena el JWT. El módulo A debe validar y restaurar la sesión con /auth/me. */
export const tokenStore = {
  get: (): string | null => token,
  set: (value: string): void => setToken(value),
  clear: (): void => setToken(null),
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },
}
