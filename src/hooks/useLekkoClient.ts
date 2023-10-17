import { initAPIClient, type Client } from "@lekko/js-sdk"
import { RepositoryKey } from "@buf/lekkodev_sdk.bufbuild_es/lekko/client/v1beta1/configuration_service_pb"
import { LekkoConfigMockClientContext } from "../testHelpers/LekkoConfigMockProvider"
import { useContext } from "react"

declare const process: {
  env: Record<string, string | undefined>
}

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
  return initAPIClient({
    apiKey,
    repositoryOwner,
    repositoryName,
    hostname,
  })
}

if (apiKey === undefined) throw new Error("Missing Lekko API key env variable")
if (repositoryOwner === undefined)
  throw new Error("Missing Lekko repository owner env variable")
if (repositoryName === undefined)
  throw new Error("Missing Lekko repository name env variable")

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
