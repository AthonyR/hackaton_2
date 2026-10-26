const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '')

if (!apiBaseUrl) {
  throw new Error('Falta VITE_API_BASE_URL. Copia .env.example a .env.local y reinicia Vite.')
}

const parsedUrl = new URL(apiBaseUrl)
if (!['https:', 'http:'].includes(parsedUrl.protocol) || parsedUrl.search || parsedUrl.hash) {
  throw new Error('VITE_API_BASE_URL debe ser una URL HTTP(S), sin query ni fragmento.')
}

export const env = { apiBaseUrl } as const
