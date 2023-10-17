import { type Client } from "@lekko/js-sdk"
import { createContext, Suspense, type PropsWithChildren } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient()

export const LekkoConfigMockClientContext = createContext<Client | undefined>(
  undefined,
)

interface MockProps extends PropsWithChildren {
  client: Client
}

export function LekkoConfigMockProvider({ client, children }: MockProps) {
  return (
    <Suspense fallback={<></>}>
      <LekkoConfigMockClientContext.Provider value={client}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </LekkoConfigMockClientContext.Provider>
    </Suspense>
  )
}
