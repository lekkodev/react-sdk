import { queryClient } from "../providers/lekkoConfigProvider"
import { getCombinedContext, getContextJSON, getHistoryJSON, parseContext } from "./context"
import {
  CONFIG_REQUESTS_HISTORY,
  CONTEXT_HISTORY,
  CONTEXT_OVERRIDES,
  isUsingPersistedState,
  persistConfigEvaluations,
  persistDefaultContext,
  resetExtensionChanges,
  setContextOverrides,
  setRequestsHistory,
  upsertHistoryItem,
} from "./overrides"
import {
  type ExtensionMessage,
  REQUEST_CONFIGS,
  REQUEST_CONFIGS_RESPONSE,
  SAVE_CONFIGS,
  SAVE_CONFIGS_RESPONSE,
  SAVE_CONTEXT,
  SAVE_CONTEXT_RESPONSE,
  type RequestConfigsMessageData,
  type SaveConfigsMessageData,
  type SaveContextMessageData,
  RESET_CHANGES_RESPONSE,
  type ResetChangesMessageData,
  RESET_CHANGES,
  REQUEST_IS_USING_PERSISTED_STATE,
  type RequestIsUsingPersistedStateMessageData,
  REQUEST_IS_USING_PERSISTED_STATE_RESPONSE,
} from "./types"
import { getEvaluation } from "./evaluation"
import { type Client } from "@lekko/js-sdk"

async function handleRequestConfigs(
  client: Client,
  data: RequestConfigsMessageData,
) {
  window.postMessage(
    {
      configs: getHistoryJSON(CONFIG_REQUESTS_HISTORY),
      context: getContextJSON(getCombinedContext(CONTEXT_HISTORY, CONTEXT_OVERRIDES)),
      type: REQUEST_CONFIGS_RESPONSE,
    },
    "*",
  )
}

async function handleRequestIsUsingPersistedState(
  client: Client,
  data: RequestIsUsingPersistedStateMessageData,
) {
  console.log('handling persisted state request')
  window.postMessage(
    {
      isUsingPersistedState: isUsingPersistedState(),
      type: REQUEST_IS_USING_PERSISTED_STATE_RESPONSE,
    },
    "*",
  )
}

async function handleSaveConfigs(client: Client, data: SaveConfigsMessageData) {
  Object.entries(data.configs).forEach(([key, value]) => {
    queryClient.setQueryData(JSON.parse(key), value)
  })

  const history = CONFIG_REQUESTS_HISTORY.map((config) => {
    const newResult = data.configs[JSON.stringify(config.key)]
    return newResult === undefined ? config : { ...config, result: newResult }
  })

  setRequestsHistory(history)

  if (data.persistChanges) persistConfigEvaluations(data.configs)

  window.postMessage({ configs: getHistoryJSON(history), type: SAVE_CONFIGS_RESPONSE }, "*")
}

async function handleSaveContext(client: Client, data: SaveContextMessageData) {
  const historyItems = [...CONFIG_REQUESTS_HISTORY]
  setContextOverrides(parseContext(data.context))
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

  if (data.persistChanges) persistDefaultContext()

  window.postMessage(
    {
      configs: getHistoryJSON(CONFIG_REQUESTS_HISTORY),
      context: getContextJSON(getCombinedContext(CONTEXT_HISTORY, CONTEXT_OVERRIDES)),
      type: SAVE_CONTEXT_RESPONSE,
    },
    "*",
  )
}

async function handleReset(client: Client, data: ResetChangesMessageData) {
  resetExtensionChanges()

  const historyItems = [...CONFIG_REQUESTS_HISTORY]

  const evaluations = await Promise.all(
    historyItems.map(
      async (history) => await getEvaluation(client, history.config),
    ),
  )

  historyItems.forEach((historyItem, index) => {
    queryClient.setQueryData(historyItem.key, evaluations[index])
    upsertHistoryItem({
      ...historyItem,
      result: evaluations[index],
    })
  })

  window.postMessage(
    {
      configs: getHistoryJSON(CONFIG_REQUESTS_HISTORY),
      context: getContextJSON(CONTEXT_HISTORY),
      type: RESET_CHANGES_RESPONSE,
    },
    "*",
  )
}

export async function handleExtensionMessage(
  client: Client,
  event: ExtensionMessage,
) {
  const eventData = event.data
  if (eventData !== undefined) {
    switch (eventData.type) {
    case REQUEST_CONFIGS: {
      await handleRequestConfigs(client, eventData)
      break
    }
    case SAVE_CONFIGS: {
      await handleSaveConfigs(client, eventData)
      break
    }
    case SAVE_CONTEXT: {
      await handleSaveContext(client, eventData)
      break
    }
    case REQUEST_IS_USING_PERSISTED_STATE: {
      await handleRequestIsUsingPersistedState(client, eventData)
      break
    }
    case RESET_CHANGES: {
      await handleReset(client, eventData)
      break
    }
    }
  }
}