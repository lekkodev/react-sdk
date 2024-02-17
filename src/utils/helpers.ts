import {
  type ResolvedLekkoConfig,
  type EvaluationType,
  type LekkoConfig,
  type DefaultConfigLookup,
} from "./types"

import { type Value, type RepositoryKey } from "@lekko/js-sdk"
import { DuplicateDefaultProviderError } from "../errors/types"
import { printConfigMessage } from "../errors/printers"

export function isValue(obj: unknown): obj is Value {
  return typeof obj === "object" && obj !== null && "toJsonString" in obj
}

export function createStableKey<E extends EvaluationType>(
  config: LekkoConfig<E>,
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

export function assertExhaustive(value: never): never {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  throw new Error(`Unhandled case: ${value}`)
}

export function createDefaultStableKey<E extends EvaluationType>(
  config: LekkoConfig<E>,
  repository: RepositoryKey,
): string {
  // __ after configName represents an empty context
  return `${repository.ownerName}_${repository.repoName}_${config.namespaceName}_${config.configName}__${config.evaluationType}`
}

export function mapStableKeysToConfigs(
  configs: Array<ResolvedLekkoConfig<EvaluationType>>,
  repositoryKey: RepositoryKey,
): DefaultConfigLookup {
  return configs.reduce<DefaultConfigLookup>((acc, resolvedConfig) => {
    const stableKey = createStableKey(resolvedConfig.config, repositoryKey)
    if (acc[stableKey.join(",")] !== undefined)
      throw new DuplicateDefaultProviderError(
        printConfigMessage({
          intro: "Duplicate default config provided for",
          ...resolvedConfig.config,
          repositoryKey,
        }),
      )
    acc[stableKey.join(",")] = resolvedConfig
    return acc
  }, {})
}
