import { initAPIClient, type Client } from "@lekko/js-sdk"
import { DEFAULT_LEKKO_SETTINGS } from "../utils/constants"
import { useContext } from "react"
import { type LekkoSettings } from "../utils/types"
import { getEnvironmentVariable } from "../utils/envHelpers"
import { LekkoSettingsContext } from "../providers/lekkoSettingsProvider"
import { RepositoryKey } from ".."
import { LekkoClientContext } from "../providers/lekkoClientContext"

interface Props {
  settings?: LekkoSettings
  contextClient?: Client
}

export function getRepositoryKey(
  settings: LekkoSettings = DEFAULT_LEKKO_SETTINGS,
) {
  const repositoryOwner =
    settings?.repositoryOwner ?? getEnvironmentVariable("REPOSITORY_OWNER")
  const repositoryName =
    settings?.repositoryName ?? getEnvironmentVariable("REPOSITORY_NAME")

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
}: Props): Client {
  if (contextClient !== undefined) return contextClient

  const apiKey = settings?.apiKey ?? getEnvironmentVariable("API_KEY")
  const repositoryKey = getRepositoryKey(settings)
  const hostname = settings?.hostname ?? getEnvironmentVariable("HOSTNAME")

  if (apiKey === undefined) {
    throw new Error("Missing Lekko API key values")
  }

  return initAPIClient({
    apiKey,
    repositoryOwner: repositoryKey.ownerName,
    repositoryName: repositoryKey.repoName,
    hostname,
  })
}

export default function useLekkoClient(): Client {
  const contextClient = useContext(LekkoClientContext)
  const settings = useContext(LekkoSettingsContext)

  return init({ contextClient, settings })
}
