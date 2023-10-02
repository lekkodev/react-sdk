import { useQuery } from "react-query"
import { initAPIClient, type Client } from "js-sdk"
import { DEFAULT_REFRESH } from "../utils/constants"

declare const process: {
  env: Record<string, string | undefined>
}

export const CLIENT_STABLE_KEY = "LekkoClient"

const apiKey = process.env.REACT_APP_API_KEY
const repositoryOwner = process.env.REACT_APP_REPOSITORY_OWNER
const repositoryName = process.env.REACT_APP_REPOSITORY_NAME
const hostname = process.env.REACT_APP_HOSTNAME

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
  return client
}

export default function useLekkoClient(): Client {
  const { data: client } = useQuery(CLIENT_STABLE_KEY, init, {
    suspense: true,
    ...DEFAULT_REFRESH,
  })
  if (client === undefined) {
    throw new Error("Cannot initialize client")
  }
  return client
}
