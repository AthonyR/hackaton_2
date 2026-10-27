import type { CSSProperties } from 'react'
import type { SagaStage, SagaSummary } from '../../shared/api/types'

export type SagaStyle = CSSProperties & {
  '--saga-background': string
  '--saga-surface': string
  '--saga-primary': string
  '--saga-accent': string
  '--saga-text': string
}

export function paletteStyle(palette: SagaSummary['palette']): SagaStyle {
  return { '--saga-background': palette.background, '--saga-surface': palette.surface, '--saga-primary': palette.primary, '--saga-accent': palette.accent, '--saga-text': palette.text }
}

export function transitionName(id: string): string {
  return `saga-${Array.from(id, (character) => character.codePointAt(0)?.toString(16)).join('-')}`
}

export function stageIndex(stages: SagaStage[], slug: string | null): number {
  return Math.max(0, stages.findIndex((stage) => stage.slug === slug))
}

export function stageProgress(index: number, count: number): number {
  return count <= 1 ? 100 : Math.max(0, Math.min(100, index / (count - 1) * 100))
}

/** Proporción geométrica del trazado SVG hasta la isla activa. No altera las métricas de la API. */
export function routeFraction(stages: SagaStage[], index: number): number {
  let total = 0
  let traveled = 0
  for (let position = 1; position < stages.length; position += 1) {
    const from = stages[position - 1]
    const to = stages[position]
    if (!from || !to) continue
    const distance = Math.hypot(to.island.x - from.island.x, to.island.y - from.island.y)
    total += distance
    if (position <= index) traveled += distance
  }
  return total > 0 ? traveled / total : stageProgress(index, stages.length) / 100
}

export const sagaNumber = (value: number) => new Intl.NumberFormat('es-PE', { maximumFractionDigits: 2 }).format(value)
