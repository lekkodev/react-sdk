import { ClientContext, getNamespaceCombinations } from "@lekko/js-sdk"
import {
  type ExtensionMessageSync,
  REQUEST_OVERRIDES,
  REQUEST_OVERRIDES_RESPONSE,
  SET_OVERRIDES,
  type SimpleResult,
  type RequestOverridesData,
  ConfigRef,
} from "./types"

import { type SyncClient } from "@lekko/js-sdk"

export async function handleExtensionMessageSync(
  client: SyncClient,
  event: ExtensionMessageSync,
  setOverrides: (overrides: Record<string, SimpleResult>) => void,
  activeConfigs: ConfigRef[]
) {
  const eventData = event.data
  if (eventData !== undefined) {
    switch (eventData.type) {
      case REQUEST_OVERRIDES: {
        await handleRequestOverrides(client, eventData, activeConfigs)
        break
      }
      case SET_OVERRIDES: {
        setOverrides(eventData.overrides)
      }
    }
  }
}

function createContexts(
  contextCombinations: Array<Record<string, string>>,
): ClientContext[] {
  return contextCombinations.map((combination) => {
    const context = new ClientContext()
    Object.entries(combination).forEach(([key, value]) => {
      context.setString(key, value)
    })
    return context
  })
}

async function handleRequestOverrides(
  client: SyncClient,
  data: RequestOverridesData,
  activeConfigs: ConfigRef[]
) {
  const contexts = data.contextCombinations ?? {}
  const contextCombinations = createContexts(contexts)

  console.log(activeConfigs)

  const configs = client.getConfigs()
  const fe = configs.get("frontend")

  const result =
    fe !== undefined
      ? getNamespaceCombinations(
          fe,
          data.excludedConfigNames,
          contextCombinations,
        )
      : {}

  window.postMessage(
    {
      type: REQUEST_OVERRIDES_RESPONSE,
      result,
    },
    "*",
  )
}
