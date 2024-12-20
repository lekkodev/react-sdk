import { ClientContext, getNamespaceCombinations } from "@lekko/js-sdk"
import {
  type ExtensionMessageSync,
  REQUEST_OVERRIDES,
  REQUEST_OVERRIDES_RESPONSE,
  SET_OVERRIDES,
  type RequestOverridesData,
  type ConfigRef,
  type ResultSet,
} from "./types"

import { type SyncClient } from "@lekko/js-sdk"

export async function handleExtensionMessageSync(
  client: SyncClient,
  event: ExtensionMessageSync,
  setOverrides: (overrides: Record<string, ResultSet>) => void,
  activeConfigs: ConfigRef[],
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
  activeConfigs: ConfigRef[],
) {
  const contexts = data.contextCombinations ?? {}
  const contextCombinations = createContexts(contexts)

  const configs = client.getConfigs()
  const namespace = configs.get(data.namespace)

  if (namespace !== undefined) {
    const activeNamespace = new Map(
      [...namespace.entries()].filter(([key, value]) => {
        return activeConfigs
          .map((config) => config.configName)
          .includes(value.config.key)
      }),
    )

    const result =
      namespace !== undefined
        ? getNamespaceCombinations(
            client,
            activeNamespace,
            data.excludedConfigNames,
            contextCombinations,
          )
        : {}

    window.postMessage(
      {
        type: REQUEST_OVERRIDES_RESPONSE,
        excludedConfigNames: data.excludedConfigNames,
        result,
      },
      "*",
    )
  }
}
