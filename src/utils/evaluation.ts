import { type Client } from "@lekko/js-sdk"
import { assertExhaustive } from "./helpers"
import {
  type EvaluationResult,
  EvaluationType,
  type LekkoConfig,
} from "./types"
import { getCombinedContext } from "./context"
import { CONTEXT_OVERRIDES } from "./overrides"

export async function getEvaluation<E extends EvaluationType>(
  client: Client,
  config: LekkoConfig<E>,
): Promise<EvaluationResult<E>> {
  const { namespaceName, configName, context: configContext, evaluationType } = config

  const context = getCombinedContext(configContext, CONTEXT_OVERRIDES)

  switch (evaluationType) {
  case EvaluationType.BOOL:
    return (await client.getBool(
      namespaceName,
      configName,
      context,
    )) as EvaluationResult<E>
  case EvaluationType.FLOAT:
    return (await client.getFloat(
      namespaceName,
      configName,
      context,
    )) as EvaluationResult<E>
  case EvaluationType.INT:
    return (await client.getInt(
      namespaceName,
      configName,
      context,
    )) as EvaluationResult<E>
  case EvaluationType.STRING:
    return (await client.getString(
      namespaceName,
      configName,
      context,
    )) as EvaluationResult<E>
  case EvaluationType.JSON:
    return (await client.getJSON(
      namespaceName,
      configName,
      context,
    )) as EvaluationResult<E>
  case EvaluationType.PROTO:
    return (await client.getProto(
      namespaceName,
      configName,
      context,
    )) as EvaluationResult<E>
  default:
    return assertExhaustive(evaluationType)
  }
}
