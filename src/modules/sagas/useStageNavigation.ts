import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { useLocation, useNavigate, useNavigationType } from 'react-router'
import { isRecord } from '../../shared/api/api-error'
import type { SagaStage } from '../../shared/api/types'
import { stageIndex } from './model'

function focusLine(aside: RefObject<HTMLElement | null>): number {
  if (window.matchMedia('(min-width: 960px)').matches) return Math.round(window.innerHeight * 0.33)
  return Math.min(window.innerHeight - 36, (aside.current?.offsetHeight ?? 220) + 36)
}

export function useStageNavigation(sagaId: string, stages: SagaStage[], aside: RefObject<HTMLElement | null>) {
  const location = useLocation()
  const navigate = useNavigate()
  const navigationType = useNavigationType()
  const requested = new URLSearchParams(location.search).get('stage')
  const [activeIndex, setActiveIndex] = useState(() => stageIndex(stages, requested))
  const active = useRef(activeIndex)
  const sections = useRef(new Map<string, HTMLElement>())
  const initialized = useRef(false)
  const pendingAlignment = useRef<number | null>(null)

  const writeUrl = useCallback((index: number, replace: boolean) => {
    const stage = stages[index]
    if (!stage) return
    const search = new URLSearchParams(location.search)
    if (replace && search.get('stage') === stage.slug) return
    search.set('stage', stage.slug)
    void navigate({ pathname: location.pathname, search: `?${search.toString()}`, hash: '' }, {
      replace, preventScrollReset: true, state: { sagaScroll: sagaId, stage: stage.slug },
    })
  }, [stages, location.pathname, location.search, navigate, sagaId])

  const activate = useCallback((index: number) => {
    if (active.current !== index) {
      active.current = index
      setActiveIndex(index)
    }
  }, [])

  const align = useCallback((index: number, focus: boolean) => {
    const stage = stages[index]
    const element = stage ? sections.current.get(stage.id) : undefined
    if (!element) return
    activate(index)
    pendingAlignment.current = index
    const top = window.scrollY + element.getBoundingClientRect().top - focusLine(aside) + 4
    window.scrollTo({ top: Math.max(0, top), behavior: 'instant' })
    if (focus) element.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true })
  }, [stages, aside, activate])

  useLayoutEffect(() => {
    const index = stageIndex(stages, requested)
    const state: unknown = location.state
    const ownNavigation = isRecord(state) && state.sagaScroll === sagaId && state.stage === requested
    if (!initialized.current || navigationType === 'POP' || !ownNavigation) {
      // Sin etapa explícita, permite leer primero la introducción.
      if (requested !== null) align(index, false)
      else {
        activate(index)
        window.scrollTo({ top: 0, behavior: 'instant' })
      }
    }
    initialized.current = true
    if (stages[index]?.slug !== requested) writeUrl(index, true)
  }, [location.key, location.state, requested, navigationType, sagaId, stages, align, activate, writeUrl])

  useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      const pending = pendingAlignment.current
      if (pending !== null) {
        pendingAlignment.current = null
        const entry = stages[pending]
        const element = entry ? sections.current.get(entry.id) : undefined
        if (element) window.scrollTo({ top: Math.max(0, window.scrollY + element.getBoundingClientRect().top - focusLine(aside) + 4), behavior: 'instant' })
      }
      const line = focusLine(aside)
      let index = 0
      stages.forEach((stage, position) => {
        const element = sections.current.get(stage.id)
        if (!element) return
        const rect = element.getBoundingClientRect()
        const progress = Math.max(0, Math.min(1, (line - rect.top) / Math.max(1, rect.height)))
        element.style.setProperty('--saga-reading', String(progress))
        if (rect.top <= line + 1) index = position
      })
      if (active.current !== index) {
        activate(index)
        writeUrl(index, true)
      }
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure) }
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null
    if (aside.current) observer?.observe(aside.current)
    schedule()
    return () => {
      cancelAnimationFrame(frame)
      observer?.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [stages, aside, activate, writeUrl])

  const goTo = useCallback((index: number) => {
    const next = Math.max(0, Math.min(stages.length - 1, index))
    align(next, true)
    writeUrl(next, false)
  }, [stages.length, align, writeUrl])

  const registerSection = useCallback((id: string, element: HTMLElement | null) => {
    if (element) sections.current.set(id, element)
    else sections.current.delete(id)
  }, [])

  return { activeIndex, goTo, registerSection }
}
