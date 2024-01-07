import { queryClient } from "../providers/lekkoConfigProvider"
import { getCombinedContext } from "./context"
import {
  CONFIG_REQUESTS_HISTORY,
  CONTEXT_HISTORY,
  CONTEXT_OVERRIDES,
  setContextOverrides,
  setRequestsHistory,
  upsertHistoryItem,
} from "./overrides"
import {
  type ExtensionMessage,
  type ExtensionMessageData,
  REQUEST_CONFIGS,
  REQUEST_CONFIGS_RESPONSE,
  SAVE_CONFIGS,
  SAVE_CONFIGS_RESPONSE,
  SAVE_CONTEXT,
  SAVE_CONTEXT_RESPONSE,
} from "./types"
import { getEvaluation } from "./evaluation"
import { type Client } from "@lekko/js-sdk"

async function handleRequestConfigs(
  client: Client,
  data: ExtensionMessageData,
) {
  window.postMessage(
    {
      configs: CONFIG_REQUESTS_HISTORY,
      context: getCombinedContext(CONTEXT_HISTORY, CONTEXT_OVERRIDES),
      type: REQUEST_CONFIGS_RESPONSE,
    },
    "*",
  )
}

async function handleSaveConfigs(client: Client, data: ExtensionMessageData) {
  Object.entries(data.configs).forEach(([key, value]) => {
    queryClient.setQueryData(JSON.parse(key), value)
  })

  const history = CONFIG_REQUESTS_HISTORY.map((config) => {
    const newResult = data.configs[JSON.stringify(config.key)]
    return newResult === undefined ? config : { ...config, result: newResult }
  })

  setRequestsHistory(history)
  window.postMessage({ configs: history, type: SAVE_CONFIGS_RESPONSE }, "*")
}

async function handleSaveContext(client: Client, data: ExtensionMessageData) {
  const historyItems = [...CONFIG_REQUESTS_HISTORY]
  setContextOverrides(data.context)
  const evaluations = await Promise.all(
    historyItems.map(
      async (history) => await getEvaluation(client, history.config),
    ),
  )

  historyItems.forEach((historyItem, index) => {
    queryClient.setQueryData(historyItem.key, evaluations[index])
    upsertHistoryItem({
      ...historyItem,
      config: {
        ...historyItem.config,
        context: getCombinedContext(
          historyItem.config.context,
          CONTEXT_OVERRIDES,
        ),
      },
      result: evaluations[index],
    })
  })

  window.postMessage(
    {
      configs: CONFIG_REQUESTS_HISTORY,
      context: getCombinedContext(CONTEXT_HISTORY, CONTEXT_OVERRIDES),
      type: SAVE_CONTEXT_RESPONSE,
    },
    "*",
  )
}

export async function handleExtensionMessage(
  client: Client,
  event: ExtensionMessage,
) {
  if (event.data !== undefined) {
    switch (event.data.type) {
    case REQUEST_CONFIGS:
      await handleRequestConfigs(client, event.data)
      break
    case SAVE_CONFIGS:
      await handleSaveConfigs(client, event.data)
      break
    case SAVE_CONTEXT:
      await handleSaveContext(client, event.data)
      break
    }
  }
}
