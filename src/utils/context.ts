import { ClientContext, Value } from "@lekko/js-sdk"
import { EditableResolvedLekkoConfig, EvaluationType } from "./types"

export function getCombinedContext(
  context: ClientContext | undefined,
  overrides: ClientContext,
) {
  if (context === undefined) return overrides
  const combined = new ClientContext()
  combined.data = {
    ...context.data,
    ...overrides.data,
  }
  return combined
}

export function getContextJSON(context: ClientContext | undefined) {
    if (context === undefined) return context
    const json = {
        data: {} as any
    }
    Object.entries(context.data).map(([key, value]) => {
        json.data[key] = value.toJson()
    })
    return json
}

function getHistoryItemJSON(item: EditableResolvedLekkoConfig<EvaluationType>) {
    return {
        ...item,
        config: {
            ...item.config,
            context: getContextJSON(item.config.context)
        }
    }
}

export function getHistoryJSON(history: Array<EditableResolvedLekkoConfig<EvaluationType>>) {
    return history.map(item => getHistoryItemJSON(item))
}

// todo better typing
export function parseContext(context: any): any {
    if (context === undefined) return new ClientContext()
    const parsed = {
        data: {} as any
    }
    Object.entries(context.data).map(([key, value]) => {
        parsed.data[key] = Value.fromJson(value as any)
    })
    return parsed
}