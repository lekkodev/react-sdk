import { type PropsWithChildren } from "react"
import {
  QueryClient,
  QueryClientProvider,
  useQueries,
} from "@tanstack/react-query"
import useLekkoClient from "../hooks/useLekkoClient"
import { getEvaluation } from "../utils/evaluation"
import { createStableKey } from "../utils/helpers"
import { type LekkoSettings, type LekkoConfig } from "../utils/types"
import {
  DEFAULT_LEKKO_REFRESH,
  DEFAULT_LEKKO_SETTINGS,
} from "../utils/constants"
import { LekkoSettingsContext } from "./lekkoSettingsProvider"

interface Props extends PropsWithChildren {
  configRequests?: LekkoConfig[]
  settings?: LekkoSettings
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: DEFAULT_LEKKO_REFRESH,
  },
})

export function LekkoConfigProvider(props: Props) {
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
  children,
}: Props) {
  const client = useLekkoClient()

  useQueries({
    queries: configRequests.map((config) => ({
      queryKey: createStableKey(config, client.repository),
      queryFn: async () => await getEvaluation(client, config),
      ...DEFAULT_LEKKO_REFRESH,
      suspense: true,
    })),
  })

  return <div>{children}</div>
}
