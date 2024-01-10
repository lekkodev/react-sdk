import { ClientContext } from "@lekko/js-sdk"
import {
  type ConfigResults,
  type EditableResolvedLekkoConfig,
  type EvaluationType,
} from "./types"
import { getCombinedContext } from "./context"
import { queryClient } from "../providers/lekkoConfigProvider"

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

export function upsertHistoryItem<E extends EvaluationType>(
  newConfig: EditableResolvedLekkoConfig<E>,
) {
  const index = CONFIG_REQUESTS_HISTORY.findIndex((config) => {
    return JSON.stringify(config.key) === JSON.stringify(newConfig.key)
  })

  if (newConfig.config.context !== undefined) {
    CONTEXT_HISTORY = getCombinedContext(
      CONTEXT_HISTORY,
      newConfig.config.context,
    )
  }

  if (index !== -1) {
    if (
      JSON.stringify(CONFIG_REQUESTS_HISTORY[index]) !==
      JSON.stringify(newConfig)
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
    setContextOverrides(JSON.parse(overrides))
  }
}

export function persistConfigEvaluations(configs: ConfigResults) {
  localStorage.setItem(LEKKO_CONFIG_EVALUATIONS, JSON.stringify(configs))
}

export function loadPersistedEvaluations() {
  const configs = localStorage.getItem(LEKKO_CONFIG_EVALUATIONS)
  if (configs !== null) {
    Object.entries(JSON.parse(configs)).forEach(([key, value]) => {
      queryClient.setQueryData(JSON.parse(key), value)
    })
  }
}

export function resetExtensionChanges() {
  localStorage.removeItem(LEKKO_CONTEXT_OVERRIDES)
  setContextOverrides(new ClientContext(), true)
  localStorage.removeItem(LEKKO_CONFIG_EVALUATIONS)
  loadPersistedEvaluations()
}

export function isUsingPersistedState() {
  return (
    localStorage.getItem(LEKKO_CONFIG_EVALUATIONS) !== null ||
    localStorage.getItem(LEKKO_CONTEXT_OVERRIDES) !== null
  )
}
