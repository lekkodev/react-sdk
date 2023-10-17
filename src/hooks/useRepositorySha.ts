import useLekkoClient from "./useLekkoClient"
import { useSuspenseQuery } from "@suspensive/react-query"
import { DEFAULT_LEKKO_REFRESH } from "../utils/constants"
import { LekkoQueryClientContext } from "../providers/lekkoPersistedConfigProvider"
import { type Client } from "@lekko/js-sdk"
import { handleLekkoErrors } from "../errors/errors"

export const REPOSITORY_SHA_KEY = "Lekko_Repository_Sha"

const REACT_QUERY_CACHE_KEY = "REACT_QUERY_OFFLINE_CACHE"

async function getAndCheckRepositorySha(client: Client) {
  const sha = await client.getRepoSha()
  const existingSha = localStorage.getItem(REPOSITORY_SHA_KEY)
  if (existingSha !== undefined && sha !== existingSha) {
    localStorage.removeItem(REACT_QUERY_CACHE_KEY)
  }
  localStorage.setItem(REPOSITORY_SHA_KEY, sha)
  return sha
}

export default function useRepositorySha() {
  const client = useLekkoClient()

  const { data: sha } = useSuspenseQuery({
    queryKey: [REPOSITORY_SHA_KEY],
    queryFn: async () =>
      await handleLekkoErrors(
        async () => await getAndCheckRepositorySha(client),
      ),
    ...DEFAULT_LEKKO_REFRESH,
    context: LekkoQueryClientContext,
  })

  return sha
}
