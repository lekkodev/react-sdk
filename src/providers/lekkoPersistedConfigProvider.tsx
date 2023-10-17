import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { useIsRestoring } from '@tanstack/react-query'
import { PropsWithChildren, Suspense } from 'react'
import { LekkoConfig } from '../utils/types'
import { LekkoConfigWithoutProvider, queryClient } from './lekkoConfigProvider'
import useLekkoClient, { CLIENT_STABLE_KEY } from '../hooks/useLekkoClient'
import { QueryClientProvider } from '@tanstack/react-query'
import useRepositorySha from '../hooks/useRepositorySha'

interface Props extends PropsWithChildren {
    configRequests?: LekkoConfig[]
}

const persister = createSyncStoragePersister({
    storage: window.localStorage,
})

const EXCLUDED_KEYS = [CLIENT_STABLE_KEY].map(key => JSON.stringify(key))

export function LekkoPersistedConfigProvider2(props: Props) {
    return (
        <QueryClientProvider client={queryClient} contextSharing>
            <LekkoPersistedConfigProviderInner {...props} />
        </QueryClientProvider>
    )
}

export function LekkoPersistedConfigProvider(props: Props) {
    return (
        <LekkoPersistedConfigProviderInner {...props} />
    )
}

export function LekkoPersistedConfigProviderInner(props: Props) {
    console.log('here')
    // 2 layers of providers because we need to check the sha of the repo before we use the persisted version
    const sha = useRepositorySha()
    console.log(sha)

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

// todo: delete if not needed
function RestoringBlocker(props: Props) {
    const isRestoring = useIsRestoring()

    if (isRestoring) return <></>

    return <LekkoConfigWithoutProvider {...props} />
}