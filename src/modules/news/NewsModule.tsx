import { useEffect, useState } from 'react'
import { Outlet, useMatch, useSearchParams } from 'react-router'
import { newsApi } from './api'
import { FeedContext } from './feed-context'
import { FeedController } from './feed-controller'
import { NewsFeedPage } from './NewsFeedPage'
import { newsSearch, parseNewsSearch } from './query'

function NewsSession({ filterKey }: { filterKey: string }) {
  const [controller] = useState(() => new FeedController(parseNewsSearch(filterKey), newsApi.feed))
  const detailOpen = Boolean(useMatch('/news/:id'))
  useEffect(() => {
    controller.start()
    return controller.stop
  }, [controller])
  return <FeedContext.Provider value={controller}><NewsFeedPage filterKey={filterKey} detailOpen={detailOpen} /><Outlet /></FeedContext.Provider>
}

export function NewsModule() {
  const [params, setParams] = useSearchParams()
  const key = newsSearch(parseNewsSearch(params))
  const raw = params.toString()
  useEffect(() => {
    if (raw !== key) setParams(key, { replace: true })
  }, [raw, key, setParams])
  return <NewsSession key={key} filterKey={key} />
}
