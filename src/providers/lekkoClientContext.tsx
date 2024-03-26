import { createContext } from "react"
import { type SyncClient, type Client } from "@lekko/js-sdk"

interface ClientSetup {
  contextClient: SyncClient | undefined
  setContextClient: (client: SyncClient | undefined) => void
  setFetchInitiated: (fetchInitiated: boolean) => void
  fetchInitiated: boolean
  // to differentiate between multiple levels of providers already being created
  initialized: boolean
}

export const LekkoClientContext = createContext<ClientSetup>({
  contextClient: undefined,
  setContextClient: () => {},
  setFetchInitiated: () => {},
  fetchInitiated: false,
  initialized: false,
})

export const LekkoRemoteClientContext = createContext<Client | undefined>(
  undefined,
)
