import { createContext } from "react"
import { Client } from "@lekko/js-sdk"

export const LekkoClientContext = createContext<Client | undefined>(undefined)
