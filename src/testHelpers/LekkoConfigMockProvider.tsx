import { type Client } from "@lekko/js-sdk"
import { createContext, Suspense, type PropsWithChildren } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type LekkoSettings } from "../utils/types"
import { LekkoSettingsContext } from "../providers/lekkoSettingsProvider"
import { DEFAULT_LEKKO_SETTINGS } from "../utils/constants"

const queryClient = new QueryClient()

export const LekkoConfigMockClientContext = createContext<Client | undefined>(
  undefined,
)

interface MockProps extends PropsWithChildren {
  client: Client
  settings?: LekkoSettings
}

export function LekkoConfigMockProvider({
  client,
  settings,
  children,
}: MockProps) {
  return (
    <Suspense fallback={<></>}>
      <LekkoSettingsContext.Provider value={settings ?? DEFAULT_LEKKO_SETTINGS}>
        <LekkoConfigMockClientContext.Provider value={client}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </LekkoConfigMockClientContext.Provider>
      </LekkoSettingsContext.Provider>
    </Suspense>
  )
}
