import { createContext } from "react"
import { ClientContext } from "@lekko/js-sdk"

export interface GlobalContext {
  globalContext: ClientContext
  setGlobalContext: (globalContext: ClientContext) => void
  initialized: boolean
}

export const LekkoGlobalContext = createContext<GlobalContext>({
  globalContext: new ClientContext(),
  setGlobalContext: () => {},
  initialized: false,
})
