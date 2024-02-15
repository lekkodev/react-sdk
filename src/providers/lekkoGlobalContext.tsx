import { type ClientContext } from "@lekko/js-sdk"
import { createContext } from "react"

interface GlobalContext {
  setGlobalContext: (globalContext: ClientContext) => void
}

export const LekkoGlobalContext = createContext<GlobalContext>({
  setGlobalContext: () => {},
})
