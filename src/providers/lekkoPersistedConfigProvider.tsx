import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { useIsRestoring } from '@tanstack/react-query'
import { createContext, PropsWithChildren, useMemo, } from 'react'
import { LekkoConfig } from '../utils/types'
import { LekkoConfigWithoutProvider, queryClient } from './lekkoConfigProvider'
import  { CLIENT_STABLE_KEY } from '../hooks/useLekkoClient'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import useRepositorySha from '../hooks/useRepositorySha'

interface Props extends PropsWithChildren {
    configRequests?: LekkoConfig[]
}

const persister = createSyncStoragePersister({
    storage: window.localStorage,
})

export const LekkoQueryClientContext = createContext<QueryClient | undefined>(undefined);


const EXCLUDED_KEYS = [CLIENT_STABLE_KEY].map(key => JSON.stringify(key))

export function LekkoPersistedConfigProvider2(props: Props) {
    return (
        <QueryClientProvider client={queryClient} contextSharing>
            <LekkoPersistedConfigProviderInner {...props} />
        </QueryClientProvider>
    )
}

export function LekkoPersistedConfigProvider(props: Props) {
    // the context provider allows us to use the queryClient before we instantiate the persisted layer that makes it available
    return (
        <LekkoQueryClientContext.Provider value={queryClient}>
            <LekkoPersistedConfigProviderInner {...props} />
        </LekkoQueryClientContext.Provider>
    )
}

export function LekkoPersistedConfigProviderInner(props: Props) {
    const sha = useRepositorySha()
    const persister = useMemo(() => createSyncStoragePersister({
        storage: window.localStorage,
    }), [])

    return (
        <PersistQueryClientProvider
            client={queryClient}
    
            persistOptions={{ persister, dehydrateOptions: {
                shouldDehydrateQuery: ({queryKey, state}) => {
                return !EXCLUDED_KEYS.some(key => key === JSON.stringify(queryKey))
                },
            }, }}
        >
            <LekkoConfigWithoutProvider {...props} />
        </PersistQueryClientProvider>
    )
}
