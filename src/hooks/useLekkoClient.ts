import { initCachedAPIClient, RepositoryKey } from "@lekko/js-sdk"
import { DEFAULT_LEKKO_SETTINGS } from "../utils/constants"
import { useContext, useEffect } from "react"
import { type LekkoSettings } from "../utils/types"
import {
  getAPIKeyFromEnv,
  getHostnameFromEnv,
  getRepositoryNameFromEnv,
  getRepositoryOwnerFromEnv,
} from "../utils/envHelpers"
import { LekkoClientContext } from "../providers/lekkoClientContext"
import { type SyncClient } from "@lekko/js-sdk/dist/types/client"
import { LekkoSettingsContext } from "../providers/lekkoSettingsProvider"

export function getRepositoryKey(
  settings: LekkoSettings = DEFAULT_LEKKO_SETTINGS,
) {
  const repositoryOwner =
    settings?.repositoryOwner ?? getRepositoryOwnerFromEnv()
  const repositoryName = settings?.repositoryName ?? getRepositoryNameFromEnv()

  return repositoryOwner !== undefined && repositoryName !== undefined
    ? RepositoryKey.fromJson({
        repoName: repositoryName,
        ownerName: repositoryOwner,
      })
    : undefined
}

interface LocalProps {
  settings?: LekkoSettings
  contextClient?: SyncClient
}

export async function initLocalClient({
  settings = DEFAULT_LEKKO_SETTINGS,
  contextClient,
}: LocalProps): Promise<SyncClient | undefined> {
  if (contextClient !== undefined) return contextClient

  const clientSettings = prepareClientSettings(settings)

  if (clientSettings === undefined) return undefined

  const client = await initCachedAPIClient(clientSettings)

  return client
}

export function prepareClientSettings(settings: LekkoSettings) {
  const apiKey = settings?.apiKey ?? getAPIKeyFromEnv()
  const repositoryKey = getRepositoryKey(settings)
  const hostname = settings?.hostname ?? getHostnameFromEnv()

  if (repositoryKey === undefined || apiKey === undefined) return undefined

  return {
    apiKey,
    repositoryOwner: repositoryKey?.ownerName,
    repositoryName: repositoryKey?.repoName,
    hostname,
    localPath: settings.localPath,
  }
}

export default function useLekkoClient(): SyncClient | undefined {
  const settings = useContext(LekkoSettingsContext)
  const { contextClient, setContextClient, fetchInitiated, setFetchInitiated } =
    useContext(LekkoClientContext)

  useEffect(() => {
    const setup = async () => {
      setFetchInitiated(true)
      const client = await initLocalClient({ settings })
      setContextClient(client)
    }
    if (!fetchInitiated && contextClient === undefined) {
      setup().catch((err) => {
        console.log(`Error setting up lekko client: ${err}`)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return contextClient
}
