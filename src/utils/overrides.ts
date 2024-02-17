import { ClientContext } from "@lekko/js-sdk"
import {
  EvaluationType,
  type ConfigResults,
  type EditableResolvedLekkoConfig,
  type EvaluationResult,
} from "./types"
import { getCombinedContext } from "./context"
import { type QueryClient } from "@tanstack/react-query"

export let CONFIG_REQUESTS_HISTORY: Array<
  EditableResolvedLekkoConfig<EvaluationType>
> = []

export let CONTEXT_HISTORY = new ClientContext()
export let CONTEXT_OVERRIDES = new ClientContext()

// so other files can set the history
export function setRequestsHistory(
  history: Array<EditableResolvedLekkoConfig<EvaluationType>>,
) {
  CONFIG_REQUESTS_HISTORY = history
}

export function setContextOverrides(context: ClientContext, force?: boolean) {
  CONTEXT_OVERRIDES =
    force === true ? context : getCombinedContext(CONTEXT_OVERRIDES, context)
}

export function getHistoryItem(namespaceName: string, configName: string) {
  return CONFIG_REQUESTS_HISTORY.find((evaluatedConfig) => {
    return (
      evaluatedConfig.config.namespaceName === namespaceName &&
      evaluatedConfig.config.configName === configName
    )
  })
}

export function upsertHistoryItem<E extends EvaluationType>(
  newConfig: EditableResolvedLekkoConfig<E>,
) {
  // only keep 1 copy of each config regardless of context changes
  const index = CONFIG_REQUESTS_HISTORY.findIndex((evaluatedConfig) => {
    return (
      `${evaluatedConfig.config.namespaceName}-${evaluatedConfig.config.configName}` ===
      `${newConfig.config.namespaceName}-${newConfig.config.configName}`
    )
  })

  if (newConfig.config.context !== undefined) {
    CONTEXT_HISTORY = getCombinedContext(
      CONTEXT_HISTORY,
      newConfig.config.context,
    )
  }

  if (index !== -1) {
    // the key contains the context and config info
    if (
      newConfig.key !== CONFIG_REQUESTS_HISTORY[index].key ||
      CONFIG_REQUESTS_HISTORY[index].result !== newConfig.result
    ) {
      CONFIG_REQUESTS_HISTORY = [
        ...CONFIG_REQUESTS_HISTORY.slice(0, index),
        newConfig,
        ...CONFIG_REQUESTS_HISTORY.slice(index + 1),
      ]
    }
  } else {
    CONFIG_REQUESTS_HISTORY = [...CONFIG_REQUESTS_HISTORY, newConfig]
  }
}

const LEKKO_CONTEXT_OVERRIDES = "LEKKO_CONTEXT_OVERRIDES"
const LEKKO_CONFIG_EVALUATIONS = "LEKKO_CONFIG_EVALUATIONS"

export function persistDefaultContext() {
  localStorage.setItem(
    LEKKO_CONTEXT_OVERRIDES,
    JSON.stringify(CONTEXT_OVERRIDES),
  )
}

export function loadDefaultContext() {
  const overrides = localStorage.getItem(LEKKO_CONTEXT_OVERRIDES)
  if (overrides !== null) {
    setContextOverrides(JSON.parse(overrides) as ClientContext)
  }
}

export function persistConfigEvaluations(configs: ConfigResults) {
  localStorage.setItem(LEKKO_CONFIG_EVALUATIONS, JSON.stringify(configs))
}

export function loadPersistedEvaluations(queryClient: QueryClient) {
  const configs = localStorage.getItem(LEKKO_CONFIG_EVALUATIONS)
  if (configs !== null) {
    Object.entries(JSON.parse(configs) as ConfigResults).forEach(
      ([key, result]) => {
        const cResult = result
        let value: EvaluationResult<EvaluationType> = cResult?.value
        if (cResult?.evaluationType === EvaluationType.INT) {
          value = BigInt(cResult.value)
        }
        queryClient.setQueryData(JSON.parse(key), value)
      },
    )
  }
}

export function resetExtensionChanges(queryClient: QueryClient) {
  localStorage.removeItem(LEKKO_CONTEXT_OVERRIDES)
  setContextOverrides(new ClientContext(), true)
  localStorage.removeItem(LEKKO_CONFIG_EVALUATIONS)
  loadPersistedEvaluations(queryClient)
}

export function isUsingPersistedState() {
  return (
    localStorage.getItem(LEKKO_CONFIG_EVALUATIONS) !== null ||
    localStorage.getItem(LEKKO_CONTEXT_OVERRIDES) !== null
  )
}
