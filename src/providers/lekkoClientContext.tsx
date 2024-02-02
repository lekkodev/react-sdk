import { createContext } from "react"
import { type Client } from "@lekko/js-sdk"

export const LekkoClientContext = createContext<Client | undefined>(undefined)
