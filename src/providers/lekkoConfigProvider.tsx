import { type PropsWithChildren } from "react"
import {
  QueryClient,
  QueryClientProvider,
  useQueries,
} from "@tanstack/react-query"
import useLekkoClient from "../hooks/useLekkoClient"
import { getEvaluation } from "../utils/evaluation"
import { createStableKey } from "../utils/helpers"
import { type LekkoConfig } from "../utils/types"
import { DEFAULT_LEKKO_REFRESH } from "../utils/constants"

interface Props extends PropsWithChildren {
  configRequests?: LekkoConfig[]
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
