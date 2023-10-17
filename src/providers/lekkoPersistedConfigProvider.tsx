import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { useIsRestoring, type QueryClient } from "@tanstack/react-query"
import { createContext, type PropsWithChildren, type ReactElement } from "react"
import { type LekkoConfig, type ResolvedLekkoConfig } from "../utils/types"
import { LekkoConfigWithoutProvider, queryClient } from "./lekkoConfigProvider"
import useRepositorySha from "../hooks/useRepositorySha"

interface Props extends PropsWithChildren {
  configRequests?: LekkoConfig[]
  backupResolvedConfigs?: ResolvedLekkoConfig[]
  backupResolvedDefaultConfigs?: ResolvedLekkoConfig[]
  fallback: ReactElement
}

export const persister = createSyncStoragePersister({
  storage: window.localStorage,
  throttleTime: 1,
})

export const LekkoQueryClientContext = createContext<QueryClient | undefined>(
  undefined,
)

export function LekkoPersistedConfigProvider(props: Props) {
  // the context provider allows us to use the queryClient before we instantiate the persisted layer that makes it available
  return (
    <LekkoQueryClientContext.Provider value={queryClient}>
      <LekkoPersistedConfigProviderInner {...props} />
    </LekkoQueryClientContext.Provider>
  )
}

interface PersistGateProps {
  fallback: ReactElement
  children: ReactElement
}

// this is necessary until react-query properly handles the restoring state not allowing suspense queries from
// returning as undefined until restoring is complete
// https://github.com/TanStack/query/issues/6148
export function PersistGate({ children, fallback }: PersistGateProps) {
  const isRestoring = useIsRestoring()

  return isRestoring ? fallback : children
}

export function LekkoPersistedConfigProviderInner(props: Props) {
  useRepositorySha()

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <PersistGate fallback={props.fallback}>
        <LekkoConfigWithoutProvider {...props} />
      </PersistGate>
    </PersistQueryClientProvider>
  )
}
