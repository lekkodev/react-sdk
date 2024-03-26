import {
  type ResolvedLekkoConfig,
  type DefaultConfigLookup,
  type UntypedLekkoConfig,
} from "./types"

import {
  type Value,
  type RepositoryKey,
  type ClientContext,
} from "@lekko/js-sdk"
import { DuplicateDefaultProviderError } from "../errors/types"
import { printConfigMessage } from "../errors/printers"

export function isValue(obj: unknown): obj is Value {
  return typeof obj === "object" && obj !== null && "toJsonString" in obj
}

export function createContextKey(context?: ClientContext) {
  const contextKeyParts: string[] =
    context !== undefined
      ? Object.entries(context.data)
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

  return contextKeyParts.join("_")
}

// Array return type for use in react-query
export function createStableKey(
  config: UntypedLekkoConfig,
  repository: RepositoryKey,
): string[] {
  const contextKey = createContextKey(config.context)

  return [
    `${repository.ownerName}_${repository.repoName}_${config.namespaceName}_${config.configName}${contextKey.length > 0 ? "_" : ""}${contextKey}`,
  ]
}

export function assertExhaustive(value: never): never {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  throw new Error(`Unhandled case: ${value}`)
}

export function createDefaultStableKey(
  config: UntypedLekkoConfig,
  repository: RepositoryKey,
): string {
  return `${repository.ownerName}_${repository.repoName}_${config.namespaceName}_${config.configName}`
}

export function mapStableKeysToConfigs(
  configs: ResolvedLekkoConfig[],
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
