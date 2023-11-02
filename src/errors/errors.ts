import {
  type LekkoConfig,
  type EvaluationType,
  type ResolvedLekkoConfig,
} from "../utils/types"
import {
  ConfigNotFoundError,
  type ConnectError,
  NetworkError,
  NotAuthorizedError,
} from "./types"
import { type RepositoryKey } from "@lekko/js-sdk"
import { getMockedValue } from "../mockHelpers/helpers"

export async function handleLekkoErrors<T>(
  fetch: () => Promise<T>,
  config: LekkoConfig<EvaluationType>,
  repositoryKey: RepositoryKey,
  defaultConfigs?: Record<string, ResolvedLekkoConfig<EvaluationType>>,
): Promise<T> {
  try {
    const result = await fetch()
    return result
  } catch (error) {
    console.log(
      `Error fetching this config:\ntype: ${
        config.evaluationType
      }\nnamespace: ${config.namespaceName}\nconfig name: ${
        config.configName
      }\ncontext: ${config.context?.toString()}\nrepository: ${repositoryKey.toJsonString()}`,
    )

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

    if ((error as ConnectError) !== undefined) {
      if ((error as ConnectError).code === 16) {
        throw new NotAuthorizedError(
          "Access to this method is not authorized, please check your API key or repository access",
        )
      }
      if ((error as ConnectError).rawMessage === "Failed to fetch") {
        throw new NetworkError("Failed to connect to Lekko API")
      }
      if ((error as ConnectError).rawMessage === "Feature not found") {
        throw new ConfigNotFoundError("Config does not exist")
      }
    }

    throw error
  }
}
