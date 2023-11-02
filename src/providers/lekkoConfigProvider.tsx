import { useContext, useMemo, type PropsWithChildren } from "react"
import {
  QueryClient,
  QueryClientProvider,
  useQueries,
} from "@tanstack/react-query"
import useLekkoClient, { getRepositoryKey } from "../hooks/useLekkoClient"
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
} from "../utils/constants"
import { LekkoSettingsContext } from "./lekkoSettingsProvider"
import { handleLekkoErrors } from "../errors/errors"
import LekkoDefaultConfigLookupProvider from "./lekkoDefaultConfigLookupProvider"

export interface IntermediateProviderProps extends PropsWithChildren {
  configRequests?: Array<LekkoConfig<EvaluationType>>
  settings?: LekkoSettings
}

export interface ProviderProps extends IntermediateProviderProps {
  defaultConfigs?: Array<ResolvedLekkoConfig<EvaluationType>>
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: DEFAULT_LEKKO_REFRESH,
  },
})

export function LekkoConfigProvider({
  settings,
  defaultConfigs,
  children,
}: ProviderProps) {
  const repositoryKey = useMemo(() => getRepositoryKey(settings), [settings])

  return (
    <LekkoSettingsContext.Provider value={settings ?? DEFAULT_LEKKO_SETTINGS}>
      <LekkoDefaultConfigLookupProvider.Provider
        value={
          defaultConfigs === undefined
            ? undefined
            : mapStableKeysToConfigs(defaultConfigs, repositoryKey)
        }
      >
        <QueryClientProvider client={queryClient}>
          <LekkoIntermediateConfigProvider settings={settings}>
            {children}
          </LekkoIntermediateConfigProvider>
        </QueryClientProvider>
      </LekkoDefaultConfigLookupProvider.Provider>
    </LekkoSettingsContext.Provider>
  )
}

// or as a subprovider, for example, to require a set of configs after authentication when the username is known
export function LekkoIntermediateConfigProvider({
  configRequests = [],
  children,
}: IntermediateProviderProps) {
  const defaultConfigLookup = useContext(LekkoDefaultConfigLookupProvider)
  const client = useLekkoClient()

  useQueries({
    queries: configRequests.map((config) => ({
      queryKey: createStableKey(config, client.repository),
      queryFn: async () =>
        await handleLekkoErrors(
          async () => await getEvaluation(client, config),
          config,
          client.repository,
          defaultConfigLookup,
        ),
      ...DEFAULT_LEKKO_REFRESH,
      suspense: true,
    })),
  })

  return <>{children}</>
}
