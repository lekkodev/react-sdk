import { initAPIClient, type Client, RepositoryKey } from "@lekko/js-sdk"
import { useSuspenseQuery } from "@suspensive/react-query"
import { DEFAULT_LEKKO_REFRESH } from "../utils/constants"
import { LekkoConfigMockClientContext } from "../testHelpers/LekkoConfigMockProvider"
import { useContext } from "react"
import { getEnvironmentVariable } from "../utils/viteHelpers"

export const CLIENT_STABLE_KEY = "LekkoClient"

const apiKey = getEnvironmentVariable("API_KEY")
const repositoryOwner = getEnvironmentVariable("REPOSITORY_OWNER")
const repositoryName = getEnvironmentVariable("REPOSITORY_NAME")
const hostname = getEnvironmentVariable("HOSTNAME")

export function getRepositoryKey() {
  if (repositoryOwner === undefined || repositoryName === undefined) {
    throw new Error("Missing Lekko env values")
  }

  return RepositoryKey.fromJson({
    ownerName: repositoryOwner,
    repoName: repositoryName,
  })
}

export function init(contextClient?: Client): Client {
  if (contextClient !== undefined) return contextClient
  if (
    apiKey === undefined ||
    repositoryOwner === undefined ||
    repositoryName === undefined
  ) {
    throw new Error("Missing Lekko env values")
  }
  return initAPIClient({
    apiKey,
    repositoryOwner,
    repositoryName,
    hostname,
  })
}

export default function useLekkoClient(): Client {
  const contextClient = useContext(LekkoConfigMockClientContext)

  const { data: client } = useSuspenseQuery({
    queryKey: [CLIENT_STABLE_KEY],
    queryFn: async () => init(contextClient),
    ...DEFAULT_LEKKO_REFRESH,
  })

  if (contextClient !== undefined) {
    return contextClient
  }

  if (client === undefined) {
    throw new Error("Cannot initialize client")
  }
  return client
}
