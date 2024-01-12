import { ClientContext, Value } from "@lekko/js-sdk"
import { type EditableResolvedLekkoConfig, type EvaluationType } from "./types"

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

// the data we send to the extension via message is json without proper typing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JSONData = Record<string, any>
interface JSONClientContext {
  data: JSONData
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
    json.data[key] = value.toJson()
  })
  return json
}

function getHistoryItemJSON(item: EditableResolvedLekkoConfig<EvaluationType>) {
  return {
    ...item,
    config: {
      ...item.config,
      context: getContextJSON(item.config.context),
    },
  }
}

export function getHistoryJSON(
  history: Array<EditableResolvedLekkoConfig<EvaluationType>>,
) {
  return history.map((item) => getHistoryItemJSON(item))
}
