import { ApiError } from '../../shared/api/api-error'

export type AuthField = 'teamName' | 'email' | 'password'
export type AuthFields = Record<AuthField, string>
export type AuthErrors = Partial<Record<AuthField, string>>

export function validateAuth(values: AuthFields, registering: boolean): AuthErrors {
  const errors: AuthErrors = {}
  if (registering && (values.teamName.trim().length < 3 || values.teamName.trim().length > 40)) {
    errors.teamName = 'El nombre debe tener entre 3 y 40 caracteres.'
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()) || values.email.trim().length > 120) {
    errors.email = 'Escribe un email válido de hasta 120 caracteres.'
  }
  const minimum = registering ? 8 : 1
  const maximum = registering ? 72 : 120
  if (values.password.length < minimum || values.password.length > maximum) {
    errors.password = registering ? 'La contraseña debe tener entre 8 y 72 caracteres.' : 'Escribe tu contraseña (hasta 120 caracteres).'
  }
  return errors
}

export function getServerFieldErrors(error: unknown): AuthErrors {
  if (!(error instanceof ApiError)) return {}
  const fields: AuthErrors = {}
  for (const detail of error.details) {
    if (detail.field === 'teamName' || detail.field === 'email' || detail.field === 'password') {
      fields[detail.field] = detail.message
    }
  }
  if (error.code === 'EMAIL_ALREADY_REGISTERED') fields.email = error.message
  if (error.code === 'TEAM_NAME_TAKEN') fields.teamName = error.message
  return fields
}
