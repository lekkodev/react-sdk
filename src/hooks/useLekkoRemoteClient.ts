import { initAPIClient, type Client, RepositoryKey } from "@lekko/js-sdk"
import { DEFAULT_LEKKO_SETTINGS } from "../utils/constants"
import { useContext } from "react"
import { type LekkoSettings, type ExtensionMessage } from "../utils/types"
import { LekkoSettingsContext } from "../providers/lekkoSettingsProvider"
import { LekkoRemoteClientContext } from "../providers/lekkoClientContext"
import { handleExtensionMessage } from "../utils/messages"
import { type QueryClient, useQueryClient } from "@tanstack/react-query"
import { prepareClientSettings } from "./useLekkoClient"
import {
  getRepositoryNameFromEnv,
  getRepositoryOwnerFromEnv,
} from "../utils/envHelpers"

export function getRepositoryKey(
  settings: LekkoSettings = DEFAULT_LEKKO_SETTINGS,
) {
  const repositoryOwner =
    settings?.repositoryOwner ?? getRepositoryOwnerFromEnv()
  const repositoryName = settings?.repositoryName ?? getRepositoryNameFromEnv()

  if (repositoryOwner === undefined || repositoryName === undefined) {
    throw new Error("Missing Lekko repository env values")
  }

  return RepositoryKey.fromJson({
    repoName: repositoryName,
    ownerName: repositoryOwner,
  })
}

interface RemoteProps {
  settings?: LekkoSettings
  contextClient?: Client
  queryClient: QueryClient
}

export function initRemoteClient({
  settings = DEFAULT_LEKKO_SETTINGS,
  contextClient,
  queryClient,
}: RemoteProps): Client {
  if (contextClient !== undefined) return contextClient

  const clientSettings = prepareClientSettings(settings)

  if (clientSettings === undefined) {
    throw new Error("Remote client requires Lekko settings")
  }

  const client = initAPIClient(clientSettings)

  if (typeof window !== "undefined") {
    window.addEventListener("message", (event: ExtensionMessage) => {
      handleExtensionMessage(client, queryClient, event).catch((error) => {
        console.error(error)
      })
    })
  }

  return client
}

export default function useLekkoRemoteClient(): Client {
  const contextClient = useContext(LekkoRemoteClientContext)
  const settings = useContext(LekkoSettingsContext)
  const queryClient = useQueryClient()

  return initRemoteClient({ contextClient, settings, queryClient })
}
