import { type LekkoConfig } from "./types"

import { type Value } from "@buf/lekkodev_sdk.bufbuild_es/lekko/client/v1beta1/configuration_service_pb"

export function isValue(obj: unknown): obj is Value {
  return typeof obj === "object" && obj !== null && "toJsonString" in obj
}

export function createStableKey(config: LekkoConfig): string {
  const contextKeyParts: string[] = Object.entries(config.context.data)
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

  const contextKey = contextKeyParts.join("_")

  return `${config.namespaceName}_${config.configName}_${contextKey}_${config.evaluationType}`
}

export function assertExhaustive(value: never): never {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  throw new Error(`Unhandled case: ${value}`)
}
