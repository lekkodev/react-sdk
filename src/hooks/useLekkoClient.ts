import { initAPIClient, type Client } from "@lekko/js-sdk"
import { DEFAULT_LEKKO_SETTINGS } from "../utils/constants"
import { useContext } from "react"
import {
  SAVE_CONFIGS,
  type LekkoSettings,
  REQUEST_CONFIGS,
  REQUEST_CONFIGS_RESPONSE,
  SAVE_CONFIGS_RESPONSE,
  type ExtensionMessage,
} from "../utils/types"
import { getEnvironmentVariable } from "../utils/envHelpers"
import { LekkoSettingsContext } from "../providers/lekkoSettingsProvider"
import { RepositoryKey } from ".."
import { LekkoClientContext } from "../providers/lekkoClientContext"
import {
  CONFIG_REQUESTS_HISTORY,
  queryClient,
  setRequestsHistory,
} from "../providers/lekkoConfigProvider"

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

function handleExtensionMessage(event: ExtensionMessage) {
  const eventData = event.data
  if (eventData !== undefined && eventData.type === REQUEST_CONFIGS) {
    window.postMessage(
      { configs: CONFIG_REQUESTS_HISTORY, type: REQUEST_CONFIGS_RESPONSE },
      "*",
    )
  } else if (eventData !== undefined && eventData.type === SAVE_CONFIGS) {
    const data = eventData
    if (data === undefined)
      throw new Error("Incorrect message format for save configs")
    Object.entries(eventData.configs).forEach(([key, value]) => {
      queryClient.setQueryData(JSON.parse(key), value)
    })
    const history = CONFIG_REQUESTS_HISTORY.map((config) => {
      const newResult = data.configs[JSON.stringify(config.key)]
      return newResult === undefined
        ? config
        : {
          ...config,
          result: newResult,
        }
    })
    setRequestsHistory(history)
    window.postMessage({ configs: history, type: SAVE_CONFIGS_RESPONSE }, "*")
  }
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

  window.addEventListener("message", handleExtensionMessage)

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
