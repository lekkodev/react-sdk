import { type Client } from "js-sdk"
import { assertExhaustive } from "./helpers"
import { EvaluationType, type LekkoConfig } from "./types"

export async function getEvaluation(client: Client, config: LekkoConfig) {
  const { namespaceName, configName, context, evaluationType } = config

  switch (evaluationType) {
  case EvaluationType.BOOL:
    return client.getBool(namespaceName, configName, context)
  case EvaluationType.FLOAT:
    return client.getFloat(namespaceName, configName, context)
  case EvaluationType.INT:
    return client.getInt(namespaceName, configName, context)
  case EvaluationType.STRING:
    return client.getString(namespaceName, configName, context)
  case EvaluationType.JSON:
    return client.getJSON(namespaceName, configName, context)
  case EvaluationType.PROTO:
    return client.getProto(namespaceName, configName, context)
  default:
    return assertExhaustive(evaluationType)
  }
}
