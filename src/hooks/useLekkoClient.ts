import { type Client, initCachedAPIClient } from "@lekko/js-sdk"
import { DEFAULT_LEKKO_SETTINGS } from "../utils/constants"
import { useContext } from "react"
import { type LekkoSettings } from "../utils/types"
import { getEnvironmentVariable } from "../utils/envHelpers"
import { LekkoSettingsContext } from "../providers/lekkoSettingsProvider"
import { RepositoryKey } from "@lekko/js-sdk"
import { LekkoClientContext } from "../providers/lekkoClientContext"
import { type QueryClient } from "@tanstack/react-query"
import { SyncClient } from "@lekko/js-sdk/dist/types/client"

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

interface LocalProps {
  settings?: LekkoSettings
  contextClient?: SyncClient
}

export async function initLocalClient({
  settings = DEFAULT_LEKKO_SETTINGS,
  contextClient,
}: LocalProps): Promise<SyncClient> {
  if (contextClient !== undefined) return contextClient;

  const clientSettings = prepareClientSettings(settings);

  const client = await initCachedAPIClient(clientSettings)
  
  return client;
}

export function prepareClientSettings(settings: LekkoSettings) {
  const apiKey = settings?.apiKey ?? getEnvironmentVariable("LEKKO_API_KEY");
  const repositoryKey = getRepositoryKey(settings);
  const hostname = settings?.hostname ?? getEnvironmentVariable("LEKKO_HOSTNAME");

  if (apiKey === undefined) {
    throw new Error("Missing Lekko API key values");
  }

  return {
    apiKey,
    repositoryOwner: repositoryKey.ownerName,
    repositoryName: repositoryKey.repoName,
    hostname,
    localPath: settings.localPath,
  };
}

export default function useLekkoClient(): SyncClient {
  const contextClient = useContext(LekkoClientContext)
  const settings = useContext(LekkoSettingsContext)

  if (contextClient === undefined) {
    throw new Error('Cannot synchronously initialize local evaluator, please use a LekkoProvider with a suspense boundary')
  }
 
  return contextClient
}

