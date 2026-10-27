import type { WantedSummary } from '../../shared/api/types'

export const berries = (value: number) => `${new Intl.NumberFormat('es-PE').format(value)} berries`
export function wantedDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Fecha no disponible' : new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(date)
}

const roles: Record<WantedSummary['role'], string> = {
  CAPTAIN: 'Capitán', FIRST_MATE: 'Primer oficial', NAVIGATOR: 'Navegante', SNIPER: 'Tirador', COOK: 'Cocinero',
  DOCTOR: 'Médico', SHIPWRIGHT: 'Carpintero', MUSICIAN: 'Músico', ARCHAEOLOGIST: 'Arqueólogo', HELMSMAN: 'Timonel', FIGHTER: 'Combatiente',
}
export const wantedRole = (role: WantedSummary['role']) => roles[role]
