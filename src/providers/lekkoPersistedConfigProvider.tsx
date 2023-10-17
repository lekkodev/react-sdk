import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { useIsRestoring } from '@tanstack/react-query'
import { createContext, PropsWithChildren, ReactElement, ReactNode, useMemo, } from 'react'
import { LekkoConfig } from '../utils/types'
import { LekkoConfigWithoutProvider, queryClient } from './lekkoConfigProvider'
import  { CLIENT_STABLE_KEY } from '../hooks/useLekkoClient'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import useRepositorySha from '../hooks/useRepositorySha'

interface Props extends PropsWithChildren {
    configRequests?: LekkoConfig[]
    fallback: ReactElement
}

export const persister = createSyncStoragePersister({
    storage: window.localStorage,
    throttleTime: 1
})

export const LekkoQueryClientContext = createContext<QueryClient | undefined>(undefined);

const EXCLUDED_KEYS = [CLIENT_STABLE_KEY].map(key => JSON.stringify(key))

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
            persistOptions={{ persister, dehydrateOptions: {
                shouldDehydrateQuery: ({ queryKey }) => {
                    console.log(queryKey)
                return !EXCLUDED_KEYS.some(key => key === JSON.stringify(queryKey))
                },
            }, }}
        >
            <PersistGate fallback={props.fallback}>
                <LekkoConfigWithoutProvider {...props} />
            </PersistGate>
        </PersistQueryClientProvider>
    )
}
