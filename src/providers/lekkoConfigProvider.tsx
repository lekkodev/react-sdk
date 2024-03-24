import { PropsWithChildren, useRef } from "react"
import { ClientContext, LekkoSettings } from ".."
import { SyncClient } from "@lekko/js-sdk/dist/types/client"
import { LekkoSettingsContext } from "./lekkoSettingsProvider"
import { DEFAULT_LEKKO_SETTINGS } from "../utils/constants"
import { LekkoClientContext } from "./lekkoClientContext"
import { suspend } from 'suspend-react'
import { initLocalClient } from "../hooks/useLekkoClient"

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
    const lekkoClientRef = useRef<SyncClient | null>(null)

    const lekkoClient = suspend(async () => {
        const client = await initLocalClient({ settings })
        console.log(client)
        //lekkoClientRef.current = client
        return client
    }, [settings])

    console.log('after lekko client')

    console.log(lekkoClient)

    /*if (lekkoClientRef.current === null) {
        return <></>
    }*/

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
    settings,
    globalContext,
  }: IntermediateProviderProps) {
    // todo: global context

    return <>{children}</>
}

