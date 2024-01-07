import { ClientContext } from "@lekko/js-sdk"
import { EditableResolvedLekkoConfig, EvaluationType } from "./types"
import { getCombinedContext } from "./context"

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
  
  export function setContextOverrides(
    context: ClientContext,
  ) {
    CONTEXT_OVERRIDES = getCombinedContext(CONTEXT_OVERRIDES, context)
  }
  
  
  export function upsertHistoryItem<E extends EvaluationType>(
    newConfig: EditableResolvedLekkoConfig<E>,
  ) {
    const index = CONFIG_REQUESTS_HISTORY.findIndex(
      (config) => {
        return JSON.stringify(config.key) === JSON.stringify(newConfig.key)
      }
    )
  
    if (newConfig.config.context) {
      CONTEXT_HISTORY = getCombinedContext(CONTEXT_HISTORY, newConfig.config.context)
    }
  
    if (index !== -1) {
      if (JSON.stringify(CONFIG_REQUESTS_HISTORY[index]) !== JSON.stringify(newConfig)) {
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
  