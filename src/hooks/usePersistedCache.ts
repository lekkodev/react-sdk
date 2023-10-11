import { compress, decompress } from "lz-string"
import { type RepositoryKey } from "@buf/lekkodev_sdk.bufbuild_es/lekko/client/v1beta1/configuration_service_pb"
import { type QueryClient } from "@tanstack/react-query"
import { persistQueryClient } from "@tanstack/react-query-persist-client"
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import { CLIENT_STABLE_KEY, getRepositoryKey } from "./useLekkoClient"

function getCacheKey(repository: RepositoryKey) {
  return `${repository.ownerName}_${repository.repoName}_LEKKO_CACHE`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryData = any

function filterQueriesForPersistence(data: QueryData) {
  const { [CLIENT_STABLE_KEY]: _, ...evaluations } = data
  return evaluations
}

const throttleTime = 1000
const serialize = (data: QueryData) =>
  compress(JSON.stringify(filterQueriesForPersistence(data)))
const deserialize = (data: QueryData) => JSON.parse(decompress(data))

export const lekkoPersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: getCacheKey(getRepositoryKey()),
  throttleTime,
  serialize,
  deserialize,
})

export function usePersistedCache(queryClient: QueryClient) {
  const persist = () => {
    persistQueryClient({
      queryClient,
      persister: lekkoPersister,
      maxAge: Infinity,
    })
  }

  return persist
}
