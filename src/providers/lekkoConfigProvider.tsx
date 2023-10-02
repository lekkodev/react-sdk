import { type PropsWithChildren } from "react"
import { QueryClient, QueryClientProvider, useQueries } from "react-query"
import useLekkoClient from "../hooks/useLekkoClient"
import { getEvaluation } from "../utils/evaluation"
import { createStableKey } from "../utils/helpers"
import { type LekkoConfig } from "../utils/types"

interface Props extends PropsWithChildren {
  configRequests?: LekkoConfig[]
}

const queryClient = new QueryClient()

export function LekkoConfigProvider(props: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      <LekkoConfigProviderInner {...props} />
    </QueryClientProvider>
  )
}

function LekkoConfigProviderInner({ configRequests = [], children }: Props) {
  const client = useLekkoClient()

  useQueries(
    configRequests.map((config) => ({
      queryKey: createStableKey(config),
      queryFn: async () => await getEvaluation(client, config),
      staleTime: Infinity,
      suspense: true,
    })),
  )

  return <div>{children}</div>
}
