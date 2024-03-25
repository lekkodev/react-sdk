import {
  type LekkoConfig,
  type EvaluationType,
  type DefaultConfigLookup,
} from "../utils/types"
import {
  ConfigNotFoundError,
  type ConnectError,
  NetworkError,
  NotAuthorizedError,
} from "./types"
import { type RepositoryKey } from "@lekko/js-sdk"
import { getMockedValue } from "../mockHelpers/helpers"
import { printConfigMessage } from "./printers"

export async function handleLekkoErrorsAsync<T>(
  fetch: () => Promise<T>,
  config: LekkoConfig<EvaluationType>,
  repositoryKey: RepositoryKey,
  defaultConfigs?: DefaultConfigLookup,
): Promise<T> {
  try {
    const result = await fetch()
    return result
  } catch (error) {
    console.log(
      printConfigMessage({
        intro: "Error fetching this config",
        ...config,
        repositoryKey,
      }),
    )

    const cError = error as ConnectError

    // handle authentication and config not found errors regardless of defaults
    if (cError !== undefined) {
      if (cError.code === 16) {
        throw new NotAuthorizedError(
          "Access to this method is not authorized, please check your API key or repository access",
        )
      }
      if (cError.rawMessage === "Feature not found") {
        throw new ConfigNotFoundError("Config does not exist")
      }
    }

    if (defaultConfigs !== undefined) {
      // catch the mocked value error if there is no match, but show underlying error to user
      try {
        return await getMockedValue(
          config.evaluationType,
          config.namespaceName,
          config.configName,
          config.context,
          repositoryKey,
          defaultConfigs,
        )
      } catch (err) {}
    }

    if (cError?.rawMessage === "Failed to fetch") {
      throw new NetworkError("Failed to connect to Lekko API")
    }

    throw error
  }
}

export function handleLekkoErrors<T>(
  fetch: () => T,
  config: LekkoConfig<EvaluationType>,
  repositoryKey: RepositoryKey,
): T {
  try {
    const result = fetch()
    return result
  } catch (error) {
    console.log(
      printConfigMessage({
        intro: "Error fetching this config",
        ...config,
        repositoryKey,
      }),
    )

    const cError = error as ConnectError

    // handle authentication and config not found errors regardless of defaults
    if (cError !== undefined) {
      if (cError.code === 16) {
        throw new NotAuthorizedError(
          "Access to this method is not authorized, please check your API key or repository access",
        )
      }
      if (cError.rawMessage === "Feature not found") {
        throw new ConfigNotFoundError("Config does not exist")
      }
    }

    if (cError?.rawMessage === "Failed to fetch") {
      throw new NetworkError("Failed to connect to Lekko API")
    }

    throw error
  }
}
