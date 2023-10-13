import { initAPIClient, type Client } from "js-sdk"
import { RepositoryKey } from "@buf/lekkodev_sdk.bufbuild_es/lekko/client/v1beta1/configuration_service_pb"
import { useSuspenseQuery } from "@suspensive/react-query"
import { DEFAULT_LEKKO_REFRESH } from "../utils/constants"
import { LekkoConfigMockClientContext } from "../testHelpers/LekkoConfigMockProvider"
import { useContext } from "react"

declare const process: {
  env: Record<string, string | undefined>
}

export const CLIENT_STABLE_KEY = "LekkoClient"

const apiKey = process.env.REACT_APP_API_KEY
const repositoryOwner = process.env.REACT_APP_REPOSITORY_OWNER
const repositoryName = process.env.REACT_APP_REPOSITORY_NAME
const hostname = process.env.REACT_APP_HOSTNAME

export function getRepositoryKey() {
  if (repositoryOwner === undefined || repositoryName === undefined) {
    throw new Error("Missing Lekko env values")
  }

  return RepositoryKey.fromJson({
    ownerName: repositoryOwner,
    repoName: repositoryName,
  })
}

export async function init(contextClient?: Client): Promise<Client> {
  if (contextClient !== undefined) return contextClient
  if (
    apiKey === undefined ||
    repositoryOwner === undefined ||
    repositoryName === undefined
  ) {
    throw new Error("Missing Lekko env values")
  }
  const client = await initAPIClient({
    apiKey,
    repositoryOwner,
    repositoryName,
    hostname,
  })
  return client
}

export default function useLekkoClient(): Client {
  const contextClient = useContext(LekkoConfigMockClientContext)

  const { data: client } = useSuspenseQuery({
    queryKey: [CLIENT_STABLE_KEY],
    queryFn: async () => await init(contextClient),
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
