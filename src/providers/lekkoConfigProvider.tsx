import { type PropsWithChildren } from "react"
import {
  QueryClient,
  QueryClientProvider,
  useQueries,
  useQuery,
} from "@tanstack/react-query"
import useLekkoClient from "../hooks/useLekkoClient"
import { getEvaluation } from "../utils/evaluation"
import { createStableKey, mapStableKeysToConfigs } from "../utils/helpers"
import {
  type LekkoSettings,
  type LekkoConfig,
  type EvaluationType,
  type ResolvedLekkoConfig,
} from "../utils/types"
import {
  DEFAULT_LEKKO_REFRESH,
  DEFAULT_LEKKO_SETTINGS,
  DEFAULT_LOOKUP_KEY,
} from "../utils/constants"
import { LekkoSettingsContext } from "./lekkoSettingsProvider"
import { handleLekkoErrors } from "../errors/errors"

export interface ProviderProps extends PropsWithChildren {
  configRequests?: Array<LekkoConfig<EvaluationType>>
  settings?: LekkoSettings
  defaultConfigs?: Array<ResolvedLekkoConfig<EvaluationType>>
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: DEFAULT_LEKKO_REFRESH,
  },
})

export function LekkoConfigProvider(props: ProviderProps) {
  return (
    <LekkoSettingsContext.Provider
      value={props.settings ?? DEFAULT_LEKKO_SETTINGS}
    >
      <QueryClientProvider client={queryClient}>
        <LekkoIntermediateConfigProvider {...props} />
      </QueryClientProvider>
    </LekkoSettingsContext.Provider>
  )
}

// or as a subprovider, for example, to require a set of configs after authentication when the username is known
export function LekkoIntermediateConfigProvider({
  configRequests = [],
  defaultConfigs = [],
  children,
}: ProviderProps) {
  const client = useLekkoClient()

  const { data: backupLookup } = useQuery({
    queryKey: DEFAULT_LOOKUP_KEY,
    queryFn: () => mapStableKeysToConfigs(defaultConfigs, client.repository),
    ...DEFAULT_LEKKO_REFRESH,
  })

  useQueries({
    queries: configRequests.map((config) => ({
      queryKey: createStableKey(config, client.repository),
      queryFn: async () =>
        await handleLekkoErrors(
          async () => await getEvaluation(client, config),
          config,
          client.repository,
          backupLookup,
        ),
      ...DEFAULT_LEKKO_REFRESH,
      suspense: true,
    })),
  })

  return <>{children}</>
}
