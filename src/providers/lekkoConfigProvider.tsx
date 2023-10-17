import { type PropsWithChildren } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import useLekkoClient from "../hooks/useLekkoClient"
import { getEvaluation } from "../utils/evaluation"
import {
  createDefaultStableKey,
  createStableKey,
  mapStableKeysToConfigs,
} from "../utils/helpers"
import { type ResolvedLekkoConfig, type LekkoConfig } from "../utils/types"
import { DEFAULT_LEKKO_REFRESH, DEFAULT_LOOKUP_KEY } from "../utils/constants"
import { useSuspenseQueries, useSuspenseQuery } from "@suspensive/react-query"
import { handleLekkoErrors } from "../errors/errors"

interface Props extends PropsWithChildren {
  configRequests?: LekkoConfig[]
  backupResolvedDefaultConfigs?: ResolvedLekkoConfig[]
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: DEFAULT_LEKKO_REFRESH,
  },
})

export function LekkoConfigProvider(props: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      <LekkoConfigWithoutProvider {...props} />
    </QueryClientProvider>
  )
}

// for use if your project is already using react-query
export function LekkoConfigWithoutProvider({
  configRequests = [],
  backupResolvedDefaultConfigs = [],
  children,
}: Props) {
  const client = useLekkoClient()

  const { data: backupLookup } = useSuspenseQuery({
    queryKey: DEFAULT_LOOKUP_KEY,
    queryFn: () =>
      mapStableKeysToConfigs(backupResolvedDefaultConfigs, client.repository),
    ...DEFAULT_LEKKO_REFRESH,
  })

  useSuspenseQueries({
    queries: configRequests.map((config) => ({
      queryKey: createStableKey(config, client.repository),
      queryFn: async () =>
        await handleLekkoErrors(
          async () => await getEvaluation(client, config),
          createDefaultStableKey(config, client.repository),
          backupLookup,
        ),
      ...DEFAULT_LEKKO_REFRESH,
    })),
  })

  return <div>{children}</div>
}
