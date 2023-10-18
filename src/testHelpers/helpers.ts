import { type ResolvedLekkoConfig } from "./types"

import { createStableKey } from "../utils/helpers"
import { type EvaluationType, type LekkoConfig } from "../utils/types"
import { ClientContext, RepositoryKey } from "@lekko/js-sdk"

export function createStableTestKey(
  resolvedConfig: LekkoConfig,
  repository: RepositoryKey,
): string {
  return createStableKey(resolvedConfig, repository).join(",")
}

export function mapStableKeysToConfigs(
  configs: ResolvedLekkoConfig[],
  repository: RepositoryKey,
): Record<string, ResolvedLekkoConfig> {
  return configs.reduce<Record<string, ResolvedLekkoConfig>>((acc, config) => {
    const stableKey = createStableTestKey(config, repository)
    acc[stableKey] = config
    return acc
  }, {})
}

export async function getMockedValue<T>(
  evaluationType: EvaluationType,
  namespaceName: string,
  configName: string,
  context: ClientContext | undefined,
  repositoryKey: RepositoryKey,
  lookupMap: Record<string, ResolvedLekkoConfig>,
  defaultLookupMap: Record<string, ResolvedLekkoConfig>,
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
