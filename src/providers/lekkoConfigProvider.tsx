import { useContext, useRef, type PropsWithChildren } from "react"
import useLekkoClient, { getRepositoryKey, init } from "../hooks/useLekkoClient"
import { getEvaluation } from "../utils/evaluation"
import { createStableKey, mapStableKeysToConfigs } from "../utils/helpers"
import {
  type LekkoSettings,
  type LekkoConfig,
  type EvaluationType,
  type ResolvedLekkoConfig,
  type DefaultConfigLookup,
} from "../utils/types"
import {
  DEFAULT_LEKKO_REFRESH,
  DEFAULT_LEKKO_SETTINGS,
} from "../utils/constants"
import { LekkoSettingsContext } from "./lekkoSettingsProvider"
import { handleLekkoErrors } from "../errors/errors"
import LekkoDefaultConfigLookupProvider from "./lekkoDefaultConfigLookupProvider"
import {
  type DehydratedState,
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
  useQueries,
} from "@tanstack/react-query"
import { type Client } from "@lekko/js-sdk"
import { LekkoClientContext } from "./lekkoClientContext"
import { upsertHistoryItem } from "../utils/overrides"

export interface IntermediateProviderProps extends PropsWithChildren {
  configRequests?: Array<LekkoConfig<EvaluationType>>
  settings?: LekkoSettings
}

export interface ProviderProps extends IntermediateProviderProps {
  defaultConfigs?: Array<ResolvedLekkoConfig<EvaluationType>>
  dehydratedState?: DehydratedState
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: DEFAULT_LEKKO_REFRESH,
  },
})

export function LekkoConfigProvider({
  settings,
  defaultConfigs,
  dehydratedState,
  configRequests,
  children,
}: ProviderProps) {
  const lekkoClientRef = useRef<Client | null>(null)

  if (lekkoClientRef.current === null) {
    lekkoClientRef.current = init({ settings })
  }

  const lookupRef = useRef<DefaultConfigLookup | null | undefined>(null)

  if (lookupRef.current === null) {
    lookupRef.current =
      defaultConfigs === undefined
        ? undefined
        : mapStableKeysToConfigs(defaultConfigs, getRepositoryKey(settings))
  }

  // should never happen after sync init function
  if (lookupRef.current === null || lekkoClientRef === null) {
    return <>{children}</>
  }

  return (
    <LekkoClientContext.Provider value={lekkoClientRef.current}>
      <LekkoSettingsContext.Provider value={settings ?? DEFAULT_LEKKO_SETTINGS}>
        <LekkoDefaultConfigLookupProvider.Provider value={lookupRef.current}>
          <QueryClientProvider client={queryClient}>
            <HydrationBoundary state={dehydratedState ?? {}}>
              <LekkoIntermediateConfigProvider
                settings={settings}
                configRequests={configRequests}
              >
                {children}
              </LekkoIntermediateConfigProvider>
            </HydrationBoundary>
          </QueryClientProvider>
        </LekkoDefaultConfigLookupProvider.Provider>
      </LekkoSettingsContext.Provider>
    </LekkoClientContext.Provider>
  )
}

// or as a subprovider, for example, to require a set of configs after authentication when the username is known
export function LekkoIntermediateConfigProvider({
  configRequests = [],
  children,
  settings,
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
      suspense: settings?.nonBlockingProvider !== true,
    })),
  })

  const editableRequests = configRequests.map((config) => {
    const key = createStableKey(config, client.repository)
    const result = queryClient.getQueryData(key)
    return {
      config,
      result,
      key,
    }
  })

  editableRequests.forEach((historyItem) => {
    upsertHistoryItem(historyItem)
  })

  return <>{children}</>
}
