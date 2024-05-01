import { type PropsWithChildren, useContext, useState, useEffect } from "react"
import { getCombinedContext } from "../utils/context"
import { LekkoSettingsContext } from "./lekkoSettingsProvider"
import { DEFAULT_LEKKO_SETTINGS } from "../utils/constants"
import { LekkoClientContext } from "./lekkoClientContext"
import { suspend } from "suspend-react"
import { initLocalClient } from "../hooks/useLekkoClient"
import { LekkoGlobalContext } from "./lekkoGlobalContext"
import { ClientContext, type SyncClient } from "@lekko/js-sdk"
import {
  type SimpleResult,
  type LekkoSettings,
  type ConfigRef,
  type ExtensionMessageSync,
} from "../utils/types"
import { LekkoOverrideContext } from "./lekkoOverrideProvider"
import { LekkoConfigTrackerProvider } from "./lekkoConfigTrackerContext"
import { handleExtensionMessageSync } from "../utils/syncMessages"

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
  const [activeConfigs, setActiveConfigs] = useState<ConfigRef[]>([])
  const [overrides, setOverrides] = useState<Record<string, SimpleResult>>({})

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

  useEffect(() => {
    if (typeof window !== "undefined" && contextClient !== undefined) {
      const handleMessage = async (event: ExtensionMessageSync) => {
        await handleExtensionMessageSync(
          contextClient,
          event,
          setOverrides,
          activeConfigs,
        ).catch((error) => {
          console.error(error)
        })
      }

      window.addEventListener("message", handleMessage)

      return () => {
        window.removeEventListener("message", handleMessage)
      }
    }
  }, [JSON.stringify(activeConfigs), contextClient !== undefined, setOverrides])

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
        <LekkoOverrideContext.Provider value={{ overrides, setOverrides }}>
          <LekkoConfigTrackerProvider
            activeConfigs={activeConfigs}
            setActiveConfigs={setActiveConfigs}
          >
            <LekkoIntermediateConfigProvider
              settings={settings}
              globalContext={globalContext}
            >
              {children}
            </LekkoIntermediateConfigProvider>
          </LekkoConfigTrackerProvider>
        </LekkoOverrideContext.Provider>
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
  const [activeConfigs, setActiveConfigs] = useState<ConfigRef[]>([])
  const [overrides, setOverrides] = useState<Record<string, SimpleResult>>({})

  // TODO: For use in Next.js, we need to call POST methods in a useEffect
  // or similar after the first render
  const lekkoClient = suspend(async () => {
    if (!clientSetup.initialized) {
      const client = await initLocalClient({ settings })
      return client
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined" && lekkoClient !== undefined) {
      const handleMessage = async (event: ExtensionMessageSync) => {
        await handleExtensionMessageSync(
          lekkoClient,
          event,
          setOverrides,
          activeConfigs,
        ).catch((error) => {
          console.error(error)
        })
      }

      window.addEventListener("message", handleMessage)

      return () => {
        window.removeEventListener("message", handleMessage)
      }
    }
  }, [JSON.stringify(activeConfigs), lekkoClient !== undefined, setOverrides])

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
        <LekkoOverrideContext.Provider value={{ overrides, setOverrides }}>
          <LekkoConfigTrackerProvider
            activeConfigs={activeConfigs}
            setActiveConfigs={setActiveConfigs}
          >
            <LekkoIntermediateConfigProvider
              settings={settings}
              globalContext={globalContext}
            >
              {children}
            </LekkoIntermediateConfigProvider>
          </LekkoConfigTrackerProvider>
        </LekkoOverrideContext.Provider>
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
