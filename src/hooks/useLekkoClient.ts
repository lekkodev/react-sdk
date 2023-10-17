import { initAPIClient, type Client } from "js-sdk"
import { RepositoryKey } from "@buf/lekkodev_sdk.bufbuild_es/lekko/client/v1beta1/configuration_service_pb"
import { useSuspenseQuery } from "@suspensive/react-query"
import { DEFAULT_LEKKO_REFRESH } from "../utils/constants"
import { LekkoConfigMockClientContext } from "../testHelpers/LekkoConfigMockProvider"
import { useContext } from "react"

declare const process: {
  env: Record<string, string | undefined>
}

export const CLIENT_STABLE_KEY = ["LekkoClient"]

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

export function init(contextClient?: Client): Client {
  if (contextClient !== undefined) return contextClient
  if (
    apiKey === undefined ||
    repositoryOwner === undefined ||
    repositoryName === undefined
  ) {
    throw new Error("Missing Lekko env values")
  }
  const client = initAPIClient({
    apiKey,
    repositoryOwner,
    repositoryName,
    hostname,
  })
  return client
}

if (!apiKey) throw new Error("No api key")
if (!repositoryOwner) throw new Error("No repository owner")
if (!repositoryName) throw new Error("No repository name")

export const lekkoClient: Client = initAPIClient({
    apiKey,
    repositoryOwner,
    repositoryName,
    hostname,
})

export default function useLekkoClient(): Client {
  const contextClient = useContext(LekkoConfigMockClientContext)

  if (contextClient !== undefined) {
    return contextClient
  }

  return lekkoClient
}
