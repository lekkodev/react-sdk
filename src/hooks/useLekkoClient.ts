import { initAPIClient, type Client } from "@lekko/js-sdk"
import { useSuspenseQuery } from "@suspensive/react-query"
import {
  DEFAULT_LEKKO_REFRESH,
  DEFAULT_LEKKO_SETTINGS,
} from "../utils/constants"
import { LekkoConfigMockClientContext } from "../providers/lekkoConfigMockProvider"
import { useContext } from "react"
import { type LekkoSettings } from "../utils/types"
import { getEnvironmentVariable } from "../utils/envHelpers"
import { LekkoSettingsContext } from "../providers/lekkoSettingsProvider"

export const CLIENT_STABLE_KEY = "LekkoClient"

interface Props {
  settings?: LekkoSettings
  contextClient?: Client
}

export function init({
  settings = DEFAULT_LEKKO_SETTINGS,
  contextClient,
}: Props): Client {
  if (contextClient !== undefined) return contextClient

  const apiKey = settings?.apiKey ?? getEnvironmentVariable("API_KEY")
  const repositoryOwner =
    settings?.repositoryOwner ?? getEnvironmentVariable("REPOSITORY_OWNER")
  const repositoryName =
    settings?.repositoryName ?? getEnvironmentVariable("REPOSITORY_NAME")
  const hostname = settings?.hostname ?? getEnvironmentVariable("HOSTNAME")

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
  const settings = useContext(LekkoSettingsContext)

  const { data: client } = useSuspenseQuery({
    queryKey: [CLIENT_STABLE_KEY],
    queryFn: async () => init({ contextClient, settings }),
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
