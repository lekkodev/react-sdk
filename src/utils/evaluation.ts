import { type Client } from "@lekko/js-sdk"
import { assertExhaustive } from "./helpers"
import { EvaluationType, type LekkoConfig } from "./types"

export async function getEvaluation(client: Client, config: LekkoConfig) {
  const { namespaceName, configName, context, evaluationType } = config

  switch (evaluationType) {
  case EvaluationType.BOOL:
    return await client.getBool(namespaceName, configName, context)
  case EvaluationType.FLOAT:
    return await client.getFloat(namespaceName, configName, context)
  case EvaluationType.INT:
    return await client.getInt(namespaceName, configName, context)
  case EvaluationType.STRING:
    return await client.getString(namespaceName, configName, context)
  case EvaluationType.JSON:
    return await client.getJSON(namespaceName, configName, context)
  case EvaluationType.PROTO:
    return await client.getProto(namespaceName, configName, context)
  default:
    return assertExhaustive(evaluationType)
  }
}
