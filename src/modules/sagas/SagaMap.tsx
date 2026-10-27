import { useId } from 'react'
import type { SagaStory } from '../../shared/api/types'
import { routeFraction } from './model'

export function SagaMap({ story, activeIndex }: { story: SagaStory; activeIndex: number }) {
  const uid = useId()
  const current = story.stages[activeIndex]
  if (!current) return null
  const width = Math.max(1, story.map.width)
  const height = Math.max(1, story.map.height)
  const size = Math.min(width, height) * 0.055
  const points = story.stages.map((stage) => `${stage.island.x},${stage.island.y}`).join(' ')
  const fraction = routeFraction(story.stages, activeIndex)
  return (
    <svg className="saga-map" viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={`${uid}-title ${uid}-description`} preserveAspectRatio="xMidYMid meet" data-active-island={current.island.id}>
      <title id={`${uid}-title`}>Mapa del recorrido: {current.island.name}</title>
      <desc id={`${uid}-description`}>El barco está en {current.island.name}, etapa {activeIndex + 1} de {story.stages.length}. Ruta: {story.stages.map((stage) => stage.island.name).join(', ')}.</desc>
      <defs><pattern id={`${uid}-grid`} width={width / 10} height={height / 5} patternUnits="userSpaceOnUse"><path d={`M ${width / 10} 0 L 0 0 0 ${height / 5}`} fill="none" stroke="var(--saga-text)" strokeOpacity="0.12" strokeWidth={size * 0.035} /></pattern></defs>
      <rect width={width} height={height} rx={size} fill="var(--saga-background)" />
      <rect width={width} height={height} fill={`url(#${uid}-grid)`} />
      <polyline points={points} fill="none" stroke="var(--saga-primary)" strokeOpacity="0.25" strokeWidth={size * 0.14} strokeDasharray={`${size * 0.25} ${size * 0.25}`} strokeLinecap="round" strokeLinejoin="round" />
      <polyline className="saga-traveled-route" points={points} pathLength={1} fill="none" stroke="var(--saga-accent)" strokeWidth={size * 0.19} strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: '1 1', strokeDashoffset: 1 - fraction }} />
      {story.stages.map((stage, index) => <g key={stage.id} aria-hidden="true"><circle cx={stage.island.x} cy={stage.island.y} r={index === activeIndex ? size * 0.8 : size * 0.5} fill="var(--saga-primary)" opacity={index <= activeIndex ? 0.95 : 0.3} /><circle cx={stage.island.x} cy={stage.island.y} r={size * 0.2} fill="var(--saga-background)" /></g>)}
      <g className="saga-boat" style={{ transform: `translate(${current.island.x}px, ${current.island.y}px)` }} aria-hidden="true">
        <circle r={size * 1.1} fill="var(--saga-background)" stroke="var(--saga-accent)" strokeWidth={size * 0.09} />
        <path d={`M ${-size * 0.75} ${size * 0.28} H ${size * 0.75} L ${size * 0.45} ${size * 0.65} H ${-size * 0.45} Z`} fill="var(--saga-accent)" />
        <path d={`M 0 ${-size * 0.8} V ${size * 0.25} M ${-size * 0.12} ${-size * 0.65} L ${-size * 0.63} ${size * 0.1} H ${-size * 0.12} Z M ${size * 0.12} ${-size * 0.7} L ${size * 0.7} ${size * 0.1} H ${size * 0.12} Z`} fill="var(--saga-text)" stroke="var(--saga-text)" strokeWidth={size * 0.06} strokeLinejoin="round" />
      </g>
    </svg>
  )
}
