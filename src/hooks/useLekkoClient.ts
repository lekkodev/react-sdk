import { useQuery, useIsRestoring } from "@tanstack/react-query"
import { initAPIClient, type Client } from "js-sdk"
import { DEFAULT_LEKKO_REFRESH } from "../utils/constants"
import { RepositoryKey } from "@buf/lekkodev_sdk.bufbuild_es/lekko/client/v1beta1/configuration_service_pb"
import { useSuspenseQuery } from '@suspensive/react-query'

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

export async function init(): Promise<Client> {
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
  const v = await client.getRepoSha()
  console.log(v)
  return client
}

export default function useLekkoClient(): Client {
  const { data: client } = useSuspenseQuery({
    queryKey: [CLIENT_STABLE_KEY],
    queryFn: init,
    ...DEFAULT_LEKKO_REFRESH,
  })
  if (client === undefined) {
    throw new Error("Cannot initialize client")
  }
  return client
}
