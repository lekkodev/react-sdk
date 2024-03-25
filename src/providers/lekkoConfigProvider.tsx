import { type PropsWithChildren, useContext } from "react"
import { getCombinedContext } from "../utils/context"
import { LekkoSettingsContext } from "./lekkoSettingsProvider"
import { DEFAULT_LEKKO_SETTINGS } from "../utils/constants"
import { LekkoClientContext } from "./lekkoClientContext"
import { suspend } from "suspend-react"
import { initLocalClient } from "../hooks/useLekkoClient"
import { type GlobalContext, LekkoGlobalContext } from "./lekkoGlobalContext"
import { type ClientContext } from "@lekko/js-sdk"
import { type LekkoSettings } from "../utils/types"

export interface IntermediateProviderProps extends PropsWithChildren {
  settings?: LekkoSettings
  globalContext?: ClientContext
}

export interface ProviderProps extends IntermediateProviderProps {
  globalContext?: ClientContext
}

export function LekkoConfigProvider({
  settings,
  globalContext,
  children,
}: ProviderProps) {
  const initializedClient = useContext(LekkoClientContext)

  const lekkoClient = suspend(async () => {
    const client = initializedClient ?? (await initLocalClient({ settings }))
    return client
  }, [])

  return (
    <LekkoClientContext.Provider value={lekkoClient}>
      <LekkoSettingsContext.Provider value={settings ?? DEFAULT_LEKKO_SETTINGS}>
        <LekkoIntermediateConfigProvider
          settings={settings}
          globalContext={globalContext}
        >
          {children}
        </LekkoIntermediateConfigProvider>
      </LekkoSettingsContext.Provider>
    </LekkoClientContext.Provider>
  )
}

export function LekkoIntermediateConfigProvider({
  children,
  globalContext,
}: IntermediateProviderProps) {
  const existingContext = useContext(LekkoGlobalContext)

  const combinedGlobalContext =
    globalContext !== undefined
      ? getCombinedContext(existingContext.globalContext, globalContext)
      : existingContext.globalContext

  const modifiedContext: GlobalContext = {
    ...existingContext,
    globalContext: combinedGlobalContext,
  }

  return (
    <LekkoGlobalContext.Provider value={modifiedContext}>
      {children}
    </LekkoGlobalContext.Provider>
  )
}
