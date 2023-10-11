import {
  type DefaultResolvedLekkoConfig,
  type ResolvedLekkoConfig,
} from "./types"

import { type RepositoryKey } from "@buf/lekkodev_sdk.bufbuild_es/lekko/client/v1beta1/configuration_service_pb"
import { createStableKey } from "../utils/helpers"
import { type LekkoConfig } from "../utils/types"
import { ClientContext } from "js-sdk"

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

export function mapStableKeysToDefaultConfigs(
  configs: DefaultResolvedLekkoConfig[],
  repository: RepositoryKey,
): Record<string, DefaultResolvedLekkoConfig> {
  return configs.reduce<Record<string, DefaultResolvedLekkoConfig>>(
    (acc, config) => {
      const stableKey = createStableTestKey(
        { ...config, context: new ClientContext() },
        repository,
      )
      acc[stableKey] = config
      return acc
    },
    {},
  )
}
