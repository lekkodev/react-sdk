import { useEffect, type PropsWithChildren } from "react"
import {
  QueryClient,
  QueryClientProvider,
  useQueries,
  useIsRestoring
} from "@tanstack/react-query"
import useLekkoClient from "../hooks/useLekkoClient"
import { getEvaluation } from "../utils/evaluation"
import { createStableKey } from "../utils/helpers"
import { type LekkoSettings, type LekkoConfig } from "../utils/types"
import { DEFAULT_LEKKO_REFRESH, DEFAULT_LEKKO_SETTINGS } from "../utils/constants"
import { usePersistedCache, lekkoPersister } from "../hooks/usePersistedCache"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"

interface Props extends PropsWithChildren {
  configRequests?: LekkoConfig[]
  settings?: LekkoSettings
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: DEFAULT_LEKKO_REFRESH
  }
})

export function LekkoConfigProvider(props: Props) {
  if (props.settings?.persist === true) {
    return (
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: lekkoPersister }}
        onSuccess={() => console.log('success')}
      >
        <RestoringProvider {...props} />
      </PersistQueryClientProvider>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <LekkoConfigProviderInner {...props} />
    </QueryClientProvider>
  )
}

function RestoringProvider(props: Props) {
  const isRestoring = useIsRestoring()

  if (isRestoring) {
    return <></>
  }

  return <LekkoConfigProviderInner {...props} />
}

function LekkoConfigProviderInner({
  configRequests = [],
  children,
  settings = DEFAULT_LEKKO_SETTINGS,
}: Props) {
  const client = useLekkoClient()
  //const persist = usePersistedCache(queryClient)

  useQueries({
    queries: configRequests.map((config) => ({
      queryKey: createStableKey(config, client.repository),
      queryFn: async () => await getEvaluation(client, config),
      staleTime: Infinity,
      suspense: true,
    })),
  })

  /*useEffect(() => {
    if (settings.persist) persist()
  }, [settings.persist, persist])*/

  return <div>{children}</div>
}
