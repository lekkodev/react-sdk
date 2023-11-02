import { createStableKey } from "../utils/helpers"
import {
  type ResolvedLekkoConfig,
  type EvaluationType,
  type LekkoConfig,
} from "../utils/types"
import { ClientContext, type RepositoryKey } from "@lekko/js-sdk"

export function createStableTestKey<E extends EvaluationType>(
  resolvedConfig: LekkoConfig<E>,
  repository: RepositoryKey,
): string {
  return createStableKey(resolvedConfig, repository).join(",")
}

export async function getMockedValue<T>(
  evaluationType: EvaluationType,
  namespaceName: string,
  configName: string,
  context: ClientContext | undefined,
  repositoryKey: RepositoryKey,
  lookupMap: Record<string, ResolvedLekkoConfig<EvaluationType>>,
  defaultLookupMap: Record<string, ResolvedLekkoConfig<EvaluationType>>,
): Promise<T> {
  const key = createStableTestKey(
    {
      namespaceName,
      configName,
      context,
      evaluationType,
    },
    repositoryKey,
  )

  if (lookupMap[key] !== undefined) {
    return await Promise.resolve(lookupMap[key].result as T)
  }

  const defaultKey = createStableTestKey(
    {
      namespaceName,
      configName,
      context: new ClientContext(),
      evaluationType,
    },
    repositoryKey,
  )

  if (defaultLookupMap[defaultKey] !== undefined) {
    return await Promise.resolve(defaultLookupMap[defaultKey].result as T)
  }

  throw new Error("No evaluation provided for this config")
}
