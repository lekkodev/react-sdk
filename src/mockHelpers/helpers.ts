import { createDefaultStableKey, createStableKey } from "../utils/helpers"
import {
  type EvaluationType,
  type LekkoConfig,
  type DefaultConfigLookup,
} from "../utils/types"
import { type ClientContext, type RepositoryKey } from "@lekko/js-sdk"
import { printConfigMessage } from "../errors/printers"

export function createStableMockKey<E extends EvaluationType>(
  resolvedConfig: LekkoConfig<E>,
  repository: RepositoryKey,
): string {
  return createStableKey(resolvedConfig, repository).join(",")
}

export async function getMockedRemoteValue<T>(
  evaluationType: EvaluationType,
  namespaceName: string,
  configName: string,
  context: ClientContext | undefined,
  repositoryKey: RepositoryKey,
  lookupMap: DefaultConfigLookup,
): Promise<T> {
  // first attempt to find a key match to our exact context if one was provided
  const key = createStableMockKey(
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

  // create a key that removes the context passed in and attempts to find a default with no context
  const defaultKey = createDefaultStableKey(
    {
      namespaceName,
      configName,
    },
    repositoryKey,
  )

  if (lookupMap[defaultKey] !== undefined) {
    return await Promise.resolve(lookupMap[defaultKey].result as T)
  }

  throw new Error(
    printConfigMessage({
      intro: "No evaluation provided for this config",
      evaluationType,
      namespaceName,
      configName,
      context,
      repositoryKey,
    }),
  )
}

export function getMockedValue<T>(
  evaluationType: EvaluationType,
  namespaceName: string,
  configName: string,
  context: ClientContext | undefined,
  repositoryKey: RepositoryKey,
  lookupMap: DefaultConfigLookup,
): T {
  // first attempt to find a key match to our exact context if one was provided
  const key = createStableMockKey(
    {
      namespaceName,
      configName,
      context,
      evaluationType,
    },
    repositoryKey,
  )

  if (lookupMap[key] !== undefined) {
    return lookupMap[key].result as T
  }

  // create a key that removes the context passed in and attempts to find a default with no context
  const defaultKey = createDefaultStableKey(
    {
      namespaceName,
      configName,
    },
    repositoryKey,
  )

  if (lookupMap[defaultKey] !== undefined) {
    return lookupMap[defaultKey].result as T
  }

  throw new Error(
    printConfigMessage({
      intro: "No evaluation provided for this config",
      evaluationType,
      namespaceName,
      configName,
      context,
      repositoryKey,
    }),
  )
}
