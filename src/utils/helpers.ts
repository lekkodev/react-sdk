import { type ResolvedLekkoConfig, type LekkoConfig } from "./types"

import {
  type Value,
  type RepositoryKey,
} from "@buf/lekkodev_sdk.bufbuild_es/lekko/client/v1beta1/configuration_service_pb"

export function isValue(obj: unknown): obj is Value {
  return typeof obj === "object" && obj !== null && "toJsonString" in obj
}

export function createStableKey(
  config: LekkoConfig,
  repository: RepositoryKey,
): string[] {
  const contextKeyParts: string[] =
    config.context !== undefined
      ? Object.entries(config.context.data)
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
        .map(([key, value]) => {
          if (isValue(value)) {
            return `${key}:${value.toJsonString()}`
          } else {
            console.error(
              `Value associated with key ${key} does not have a toJsonString method`,
            )
            return `${key}:${JSON.stringify(value)}`
          }
        })
      : []

  const contextKey = contextKeyParts.join("_")

  return [
    `${repository.ownerName}_${repository.repoName}_${config.namespaceName}_${config.configName}_${contextKey}_${config.evaluationType}`,
  ]
}

export function createDefaultStableKey(
  config: LekkoConfig,
  repository: RepositoryKey,
): string {
  return `${repository.ownerName}_${repository.repoName}_${config.namespaceName}_${config.configName}_${config.evaluationType}`
}

export function mapStableKeysToConfigs(
  configs: ResolvedLekkoConfig[],
  repository: RepositoryKey,
): Record<string, ResolvedLekkoConfig> {
  return configs.reduce<Record<string, ResolvedLekkoConfig>>((acc, config) => {
    const stableKey = createDefaultStableKey(config, repository)
    acc[stableKey] = config
    return acc
  }, {})
}

export function assertExhaustive(value: never): never {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  throw new Error(`Unhandled case: ${value}`)
}
