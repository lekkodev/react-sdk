import { createContext } from "react"
import { type SyncClient, type Client } from "@lekko/js-sdk"

export const LekkoClientContext = createContext<SyncClient | undefined>(undefined)

export const LekkoRemoteClientContext = createContext<Client | undefined>(undefined)
