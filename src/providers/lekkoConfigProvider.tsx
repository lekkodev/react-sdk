import { useContext, useRef, type PropsWithChildren, useEffect } from "react"
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
  useQueryClient,
} from "@tanstack/react-query"
import { ClientContext, type Client } from "@lekko/js-sdk"
import { LekkoClientContext } from "./lekkoClientContext"
import {
  loadDefaultContext,
  loadPersistedEvaluations,
  upsertHistoryItem,
} from "../utils/overrides"
import { getCombinedContext, getContextJSON } from "../utils/context"

export interface IntermediateProviderProps extends PropsWithChildren {
  configRequests?: Array<LekkoConfig<EvaluationType>>
  settings?: LekkoSettings
  globalContext?: ClientContext
}

export interface ProviderProps extends IntermediateProviderProps {
  defaultConfigs?: Array<ResolvedLekkoConfig<EvaluationType>>
  dehydratedState?: DehydratedState
  globalContext?: ClientContext
}

export function LekkoConfigProvider({
  settings,
  defaultConfigs,
  dehydratedState,
  configRequests,
  globalContext,
  children,
}: ProviderProps) {
  const lekkoClientRef = useRef<Client | null>(null)

  const queryClient = useQueryClient(
    new QueryClient({
      defaultOptions: {
        queries: DEFAULT_LEKKO_REFRESH,
      },
    }),
  )

  if (lekkoClientRef.current === null) {
    lekkoClientRef.current = init({ settings, queryClient })
  }

  const lookupRef = useRef<DefaultConfigLookup | null | undefined>(null)

  if (lookupRef.current === null) {
    lookupRef.current =
      defaultConfigs === undefined
        ? undefined
        : mapStableKeysToConfigs(defaultConfigs, getRepositoryKey(settings))
  }

  loadDefaultContext()
  loadPersistedEvaluations(queryClient)

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
                globalContext={globalContext}
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
  globalContext = new ClientContext(),
}: IntermediateProviderProps) {
  const queryClient = useQueryClient()

  useEffect(() => {
    queryClient.setQueryData(["lekkoGlobalContext"], globalContext)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getContextJSON(globalContext)])

  const defaultConfigLookup = useContext(LekkoDefaultConfigLookupProvider)
  const client = useLekkoClient()

  useQueries({
    queries: configRequests.map((config) => {
      const combinedConfig = {
        ...config,
        context: getCombinedContext(globalContext, config.context),
      }
      return {
        queryKey: createStableKey(combinedConfig, client.repository),
        queryFn: async () =>
          await handleLekkoErrors(
            async () => await getEvaluation(client, combinedConfig),
            combinedConfig,
            client.repository,
            defaultConfigLookup,
          ),
        ...DEFAULT_LEKKO_REFRESH,
        suspense: settings?.nonBlockingProvider !== true,
      }
    }),
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
