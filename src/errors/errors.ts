import { type EvaluationType, type ResolvedLekkoConfig } from "../utils/types"
import {
  ConfigNotFoundError,
  type ConnectError,
  NetworkError,
  NotAuthorizedError,
} from "./types"

export async function handleLekkoErrors<T>(
  fetch: () => Promise<T>,
  defaultKey?: string,
  backupResolvedDefaultConfigs?: Record<
    string,
    ResolvedLekkoConfig<EvaluationType>
  >,
): Promise<T> {
  try {
    const result = await fetch()
    return result
  } catch (error) {
    if (
      backupResolvedDefaultConfigs !== undefined &&
      defaultKey !== undefined &&
      backupResolvedDefaultConfigs[defaultKey] !== undefined
    ) {
      return backupResolvedDefaultConfigs[defaultKey] as T
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
