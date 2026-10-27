import { useRef, type KeyboardEvent } from 'react'
import { Link } from 'react-router'
import type { SagaStory } from '../../shared/api/types'
import { paletteStyle, sagaNumber, stageProgress, transitionName } from './model'
import { SagaMap } from './SagaMap'
import { useReducedMotion } from './useReducedMotion'
import { useStageNavigation } from './useStageNavigation'

export function SagaExperience({ story }: { story: SagaStory }) {
  const aside = useRef<HTMLElement>(null)
  const { activeIndex, goTo, registerSection } = useStageNavigation(story.saga.id, story.stages, aside)
  const reduced = useReducedMotion()
  const stage = story.stages[activeIndex]
  if (!stage) return null
  const progress = stageProgress(activeIndex, story.stages.length)

  function keyboard(event: KeyboardEvent<HTMLElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    if (event.target instanceof HTMLElement && event.target.closest('input, select, textarea, [contenteditable="true"]')) return
    const index = event.key === 'ArrowRight' ? activeIndex + 1 : event.key === 'ArrowLeft' ? activeIndex - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? story.stages.length - 1 : null
    if (index === null) return
    event.preventDefault()
    goTo(index)
  }

  return (
    <section className="saga-experience" style={paletteStyle(stage.palette)} onKeyDown={keyboard} aria-label={`Recorrido de ${story.saga.title}`} data-active-stage={stage.slug} data-reduced-motion={reduced}>
      <header className="saga-story-header">
        <Link to="/sagas" viewTransition={!reduced} className="saga-back">← Todas las sagas</Link>
        <p className="saga-eyebrow mt-8">Poneglyph · Saga {story.saga.order}</p>
        <h1 className="mt-4 break-words text-3xl font-semibold tracking-tight sm:text-5xl" style={{ viewTransitionName: transitionName(story.saga.id) }}>{story.saga.title}</h1>
        <p className="mt-3 text-lg opacity-80">{story.saga.subtitle}</p>
        <p className="mt-6 max-w-3xl whitespace-pre-line leading-relaxed opacity-85">{story.saga.intro}</p>
        <p className="mt-6 text-sm opacity-70">{story.saga.firstIsland} → {story.saga.lastIsland} · {sagaNumber(story.saga.totalDistanceNm)} mn</p>
        <p id="saga-keyboard-help" className="mt-5 text-sm opacity-70">Avanza con el scroll, los botones o las flechas izquierda y derecha. Inicio y Fin llevan a la primera y última etapa.</p>
      </header>
      <div className="saga-layout">
        <aside ref={aside} className="saga-instrument-panel" aria-label="Mapa y métricas de la etapa activa">
          <div className="saga-panel-heading"><p className="saga-eyebrow">Log Pose · Grand Line</p><span className="text-xs opacity-75">Etapa {activeIndex + 1}/{story.stages.length}</span></div>
          <SagaMap story={story} activeIndex={activeIndex} />
          <p className="saga-current-island" aria-live="polite" aria-atomic="true">{stage.island.name}</p>
          <dl className="saga-metrics" aria-label={`Métricas de ${stage.title}`} data-stage={stage.slug}>{stage.metrics.map((metric) => <div key={metric.key}><dt>{metric.label}</dt><dd><strong>{sagaNumber(metric.value)}</strong> <span>{metric.unit}</span></dd></div>)}</dl>
          <div className="saga-progress-label"><span>Progreso por etapas</span><span>{Math.round(progress)}%</span></div>
          <div className="saga-progress-track" role="progressbar" aria-label="Progreso del recorrido por etapas" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} aria-valuetext={`Etapa ${activeIndex + 1} de ${story.stages.length}: ${stage.title}`}><div style={{ width: `${progress}%` }} /></div>
          <nav aria-label="Navegar entre etapas" aria-describedby="saga-keyboard-help" className="saga-stage-controls">
            <button type="button" className="saga-button" disabled={activeIndex === 0} onClick={() => goTo(activeIndex - 1)}>← Anterior</button>
            <label className="sr-only" htmlFor="saga-stage-select">Ir a una etapa</label>
            <select id="saga-stage-select" value={stage.slug} onChange={(event) => goTo(story.stages.findIndex((entry) => entry.slug === event.target.value))} aria-label="Ir a una etapa" className="saga-stage-select">{story.stages.map((entry, index) => <option key={entry.id} value={entry.slug}>{index + 1}. {entry.island.name}</option>)}</select>
            <button type="button" className="saga-button" disabled={activeIndex === story.stages.length - 1} onClick={() => goTo(activeIndex + 1)}>Siguiente →</button>
          </nav>
        </aside>
        <div className="saga-narrative" aria-label="Historia completa">
          {story.stages.map((entry, index) => (
            <section key={entry.id} id={`stage-${entry.slug}`} ref={(element) => registerSection(entry.id, element)} className="saga-stage" data-active={index === activeIndex} aria-labelledby={`title-${entry.id}`}>
              <p className="saga-eyebrow">Etapa {entry.order} · {entry.island.name}</p>
              <h2 id={`title-${entry.id}`} tabIndex={-1} className="saga-stage-title">{entry.title}</h2>
              <div className="saga-reading-track" aria-hidden="true"><div className="saga-reading-fill" /></div>
              <div className="saga-paragraphs">{entry.narrative.map((paragraph, position) => <p key={position}>{paragraph}</p>)}</div>
            </section>
          ))}
          <footer className="saga-story-footer"><p className="saga-eyebrow">Fin del recorrido</p><p className="mt-3 text-xl font-semibold">{story.saga.lastIsland}</p><Link to="/sagas" viewTransition={!reduced} className="saga-button mt-5 inline-flex">Explorar otras sagas →</Link></footer>
        </div>
      </div>
    </section>
  )
}
