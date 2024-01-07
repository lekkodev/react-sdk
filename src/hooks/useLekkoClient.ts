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
  SAVE_CONTEXT,
  SAVE_CONTEXT_RESPONSE,
} from "../utils/types"
import { getEnvironmentVariable } from "../utils/envHelpers"
import { LekkoSettingsContext } from "../providers/lekkoSettingsProvider"
import { RepositoryKey } from ".."
import { LekkoClientContext } from "../providers/lekkoClientContext"

import { getEvaluation } from "../utils/evaluation"
import { getCombinedContext } from "../utils/context"
import { CONFIG_REQUESTS_HISTORY, CONTEXT_HISTORY, CONTEXT_OVERRIDES, setContextOverrides, setRequestsHistory, upsertHistoryItem } from "../utils/overrides"
import { queryClient } from "../providers/lekkoConfigProvider"

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

async function handleExtensionMessage(client: Client, event: ExtensionMessage) {
  if (event.data !== undefined && event.data.type === REQUEST_CONFIGS) {
    window.postMessage(
      { configs: CONFIG_REQUESTS_HISTORY, context: getCombinedContext(CONTEXT_HISTORY, CONTEXT_OVERRIDES), type: REQUEST_CONFIGS_RESPONSE },
      "*",
    )
  } else if (event.data !== undefined && event.data.type === SAVE_CONFIGS) {
    Object.entries(event.data.configs).forEach(([key, value]) => {
      queryClient.setQueryData(JSON.parse(key), value)
    })
    const history = CONFIG_REQUESTS_HISTORY.map((config) => {
      const newResult = event.data?.configs[JSON.stringify(config.key)]
      return newResult === undefined
        ? config
        : {
          ...config,
          result: newResult,
        }
    })
    setRequestsHistory(history)
    window.postMessage({ configs: history, type: SAVE_CONFIGS_RESPONSE }, "*")
  } else if (event.data !== undefined && event.data.type === SAVE_CONTEXT) {
    // copy in case it changes during reqs
    const historyItems = [...CONFIG_REQUESTS_HISTORY]
    setContextOverrides(event.data?.context)
    const evaluations = await Promise.all(historyItems.map(history => {
      return getEvaluation(client, history.config)
    }))
    // attempt to set them all more simultaneously instead of after each eval completes
    historyItems.forEach((historyItem, index) => {
      queryClient.setQueryData(historyItem.key, evaluations[index])
      upsertHistoryItem({
        ...historyItem,
        config: {
          ...historyItem.config,
          context: getCombinedContext(historyItem.config.context, CONTEXT_OVERRIDES)
        },
        result: evaluations[index]
      })
    })
    window.postMessage(
      { configs: CONFIG_REQUESTS_HISTORY, context: getCombinedContext(CONTEXT_HISTORY, CONTEXT_OVERRIDES), type: SAVE_CONTEXT_RESPONSE },
      "*",
    )
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

  const client = initAPIClient({
    apiKey,
    repositoryOwner: repositoryKey.ownerName,
    repositoryName: repositoryKey.repoName,
    hostname,
  })

  window.addEventListener("message", (event: ExtensionMessage) => handleExtensionMessage(client, event))

  return client
}

export default function useLekkoClient(): Client {
  const contextClient = useContext(LekkoClientContext)
  const settings = useContext(LekkoSettingsContext)

  return init({ contextClient, settings })
}
