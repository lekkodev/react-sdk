import { initAPIClient, type Client } from "@lekko/js-sdk"
import { DEFAULT_LEKKO_SETTINGS } from "../utils/constants"
import { useContext } from "react"
import { type LekkoSettings, type ExtensionMessage } from "../utils/types"
import { getEnvironmentVariable } from "../utils/envHelpers"
import { LekkoSettingsContext } from "../providers/lekkoSettingsProvider"
import { RepositoryKey } from "@lekko/js-sdk"
import { LekkoClientContext } from "../providers/lekkoClientContext"
import { handleExtensionMessage } from "../utils/messages"
import { type QueryClient, useQueryClient } from "@tanstack/react-query"

interface Props {
  settings?: LekkoSettings
  contextClient?: Client
  queryClient: QueryClient
}

export function getRepositoryKey(
  settings: LekkoSettings = DEFAULT_LEKKO_SETTINGS,
) {
  const repositoryOwner =
    settings?.repositoryOwner ??
    getEnvironmentVariable("LEKKO_REPOSITORY_OWNER")
  const repositoryName =
    settings?.repositoryName ?? getEnvironmentVariable("LEKKO_REPOSITORY_NAME")

  if (repositoryOwner === undefined || repositoryName === undefined) {
    throw new Error("Missing Lekko repository env values")
  }

  return RepositoryKey.fromJson({
    repoName: repositoryName,
    ownerName: repositoryOwner,
  })
}

export function init({
  settings = DEFAULT_LEKKO_SETTINGS,
  contextClient,
  queryClient,
}: Props): Client {
  if (contextClient !== undefined) return contextClient

  const apiKey = settings?.apiKey ?? getEnvironmentVariable("LEKKO_API_KEY")
  const repositoryKey = getRepositoryKey(settings)
  const hostname =
    settings?.hostname ?? getEnvironmentVariable("LEKKO_HOSTNAME")

  if (apiKey === undefined) {
    throw new Error("Missing Lekko API key values")
  }

  const client = initAPIClient({
    apiKey,
    repositoryOwner: repositoryKey.ownerName,
    repositoryName: repositoryKey.repoName,
    hostname,
    localPath: settings.localPath,
  })

  window.addEventListener("message", (event: ExtensionMessage) => {
    handleExtensionMessage(client, queryClient, event).catch((error) => {
      console.error(error)
    })
  })

  return client
}

export default function useLekkoClient(): Client {
  const contextClient = useContext(LekkoClientContext)
  const settings = useContext(LekkoSettingsContext)
  const queryClient = useQueryClient()

  return init({ contextClient, settings, queryClient })
}
