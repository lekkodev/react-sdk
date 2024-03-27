import { type PropsWithChildren, useContext, useState, useEffect } from "react"
import { getCombinedContext } from "../utils/context"
import { LekkoSettingsContext } from "./lekkoSettingsProvider"
import { DEFAULT_LEKKO_SETTINGS } from "../utils/constants"
import { LekkoClientContext } from "./lekkoClientContext"
import { suspend } from "suspend-react"
import { initLocalClient } from "../hooks/useLekkoClient"
import { LekkoGlobalContext } from "./lekkoGlobalContext"
import { ClientContext, type SyncClient } from "@lekko/js-sdk"
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
  const clientSetup = useContext(LekkoClientContext)
  const [contextClient, setContextClient] = useState<SyncClient | undefined>(
    clientSetup.contextClient,
  )
  const [fetchInitiated, setFetchInitiated] = useState<boolean>(
    clientSetup.fetchInitiated,
  )

  useEffect(() => {
    const setup = async () => {
      const client = await initLocalClient({ settings })
      setContextClient(client)
    }
    if (
      !clientSetup.initialized &&
      !fetchInitiated &&
      clientSetup.contextClient === undefined
    ) {
      setup().catch((err) => {
        console.log(`Error setting up lekko client: ${err}`)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // the case where an outer provider already setup the providers
  if (clientSetup.initialized) {
    return (
      <LekkoIntermediateConfigProvider
        settings={settings}
        globalContext={globalContext}
      >
        {children}
      </LekkoIntermediateConfigProvider>
    )
  }

  return (
    <LekkoClientContext.Provider
      value={{
        contextClient,
        setContextClient,
        initialized: true,
        fetchInitiated: true,
        setFetchInitiated,
      }}
    >
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

export function LekkoConfigProviderSuspend({
  settings,
  globalContext,
  children,
}: ProviderProps) {
  const clientSetup = useContext(LekkoClientContext)

  const lekkoClient = suspend(async () => {
    if (!clientSetup.initialized) {
      const client = await initLocalClient({ settings })
      return client
    }
  }, [])

  // the case where an outer provider already setup the providers
  if (clientSetup.initialized) {
    return (
      <LekkoIntermediateConfigProvider
        settings={settings}
        globalContext={globalContext}
      >
        {children}
      </LekkoIntermediateConfigProvider>
    )
  }

  return (
    <LekkoClientContext.Provider
      value={{
        fetchInitiated: true,
        initialized: true,
        contextClient: lekkoClient,
        setContextClient: () => {},
        setFetchInitiated: () => {},
      }}
    >
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

  const [context, setGlobalContext] = useState<ClientContext>(
    combinedGlobalContext ?? new ClientContext(),
  )

  useEffect(() => {
    if (existingContext.initialized) {
      existingContext.setGlobalContext(combinedGlobalContext)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalContext])

  if (existingContext.initialized) {
    return <>{children}</>
  }

  return (
    <LekkoGlobalContext.Provider
      value={{
        setGlobalContext,
        initialized: true,
        globalContext: context,
      }}
    >
      {children}
    </LekkoGlobalContext.Provider>
  )
}
