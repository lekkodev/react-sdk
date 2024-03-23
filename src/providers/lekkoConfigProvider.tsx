import { PropsWithChildren, useRef } from "react"
import { ClientContext, LekkoSettings } from ".."
import { SyncClient } from "@lekko/js-sdk/dist/types/client"

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


    return (
        <div>hi</div>
    )
}

export function LekkoIntermediateConfigProvider({
    children,
    settings,
    globalContext,
  }: IntermediateProviderProps) {


    return <>{children}</>
}

