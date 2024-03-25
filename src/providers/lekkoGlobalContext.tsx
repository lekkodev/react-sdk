import { createContext, useContext, type ReactNode } from "react"
import { ClientContext } from "@lekko/js-sdk"
import { getCombinedContext } from "../utils/context"

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

interface GlobalProviderProps {
  children: ReactNode
  initialState: GlobalContext
}

export function GlobalProvider({
  children,
  initialState,
}: GlobalProviderProps) {
  const existingContext = useContext(LekkoGlobalContext)
  const mergedContext = {
    ...existingContext,
    globalContext: getCombinedContext(
      existingContext.globalContext,
      initialState.globalContext,
    ),
    setGlobalContext: initialState.setGlobalContext,
    initialized: initialState.initialized || existingContext.initialized,
  }

  return (
    <LekkoGlobalContext.Provider value={mergedContext}>
      {children}
    </LekkoGlobalContext.Provider>
  )
}
