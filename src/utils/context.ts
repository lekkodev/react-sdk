import { ClientContext, Value } from "@lekko/js-sdk"
import {
  EvaluationType,
  type EditableResolvedLekkoConfig,
  type JSONClientContext,
  type LekkoContext,
} from "./types"

export function getCombinedContext(
  context: ClientContext | undefined,
  overrides: ClientContext | undefined,
) {
  const combined = new ClientContext()
  if (context === undefined) return overrides ?? combined
  if (overrides === undefined) return context ?? combined
  combined.data = {
    ...context.data,
    ...overrides.data,
  }
  return combined
}

export function parseContext(
  context: JSONClientContext | undefined,
): ClientContext {
  if (context === undefined) return new ClientContext()
  const parsed = new ClientContext()
  Object.entries(context.data).forEach(([key, value]) => {
    parsed.data[key] = Value.fromJson(value)
  })
  return parsed
}

export function getContextJSON(
  context: ClientContext | undefined,
): JSONClientContext | undefined {
  if (context === undefined) return context
  const json: JSONClientContext = {
    data: {},
  }
  Object.entries(context.data).forEach(([key, value]) => {
    const jsonValue = value.toJson()
    if (jsonValue !== null) {
      json.data[key] = jsonValue
    }
  })
  return json
}

function getResultJSON(item: EditableResolvedLekkoConfig) {
  switch (item.config.evaluationType) {
    case EvaluationType.INT:
      return (item.result as bigint).toString()
    case EvaluationType.PROTO:
      // unsupported
      return ""
    default:
      return item.result
  }
}

function getHistoryItemJSON(item: EditableResolvedLekkoConfig) {
  return {
    ...item,
    result: getResultJSON(item),
    config: {
      ...item.config,
      context: getContextJSON(item.config.context),
    },
  }
}

export function getHistoryJSON(history: EditableResolvedLekkoConfig[]) {
  return history.map((item) => getHistoryItemJSON(item))
}

export function toPlainContext(clientContext?: ClientContext): LekkoContext {
  const context: LekkoContext = {}
  if (clientContext === undefined) return context
  Object.entries(clientContext.data).forEach(([k, v]) => {
    switch (v.kind.case) {
      case "intValue": {
        context[k] = Number(v.kind.value) // TODO: proper conversion
        break
      }
      case "boolValue":
      case "stringValue":
      case "doubleValue": {
        context[k] = v.kind.value
      }
    }
  })
  return context
}
