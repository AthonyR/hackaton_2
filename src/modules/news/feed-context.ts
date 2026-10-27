import { createContext, useContext } from 'react'
import type { FeedController } from './feed-controller'

export const FeedContext = createContext<FeedController | null>(null)
export function useFeedController() {
  const controller = useContext(FeedContext)
  if (!controller) throw new Error('El feed debe estar dentro de NewsSession.')
  return controller
}
