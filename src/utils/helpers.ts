import { type LekkoConfig } from "./types"

import { type Value, type RepositoryKey } from "@lekko/js-sdk"

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

export function assertExhaustive(value: never): never {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  throw new Error(`Unhandled case: ${value}`)
}

interface ImportMetaEnv {
  readonly VITE_API_KEY: string
  readonly VITE_REPOSITORY_OWNER: string
  readonly VITE_REPOSITORY_NAME: string
  readonly VITE_HOSTNAME?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

type EnvVariable =
  | "API_KEY"
  | "REPOSITORY_OWNER"
  | "REPOSITORY_NAME"
  | "HOSTNAME"

export function getEnvironmentVariable(key: EnvVariable) {
  let envValue

  try {
    envValue = process.env[`REACT_APP_${key}`]
  } catch (error) {}

  try {
    if (envValue === undefined) {
      envValue = (import.meta as unknown as ImportMeta).env[`VITE_${key}`]
    }
  } catch (error) {
    console.log(
      "Neither process.env nor meta.env are defined, env variables are not available for the Lekko SDK",
    )
  }

  return envValue
}
