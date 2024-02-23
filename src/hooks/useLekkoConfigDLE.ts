import { useQuery } from "@tanstack/react-query"
import { useContext } from "react"
import { handleLekkoErrors } from "../errors/errors"
import { LekkoDefaultConfigLookupProvider } from "../providers/lekkoDefaultConfigLookupProvider"
import { DEFAULT_LEKKO_REFRESH } from "../utils/constants"
import { getEvaluation } from "../utils/evaluation"
import { createStableKey } from "../utils/helpers"
import {
  type EvaluationResult,
  type ConfigOptions,
  type EvaluationType,
  type LekkoConfig,
} from "../utils/types"
import useLekkoClient from "./useLekkoClient"
import { getHistoryItem, upsertHistoryItem } from "../utils/overrides"
import { LekkoSettingsContext } from "../providers/lekkoSettingsProvider"
import { getCombinedContext } from "../utils/context"
import { type ClientContext } from "@lekko/js-sdk"

// Discriminated union typing for pending, success, error states
export type LekkoDLE<E extends EvaluationType> =
  | {
      evaluation?: EvaluationResult<E>
      isEvaluationLoading: true
      error: null
    }
  | {
      evaluation: EvaluationResult<E>
      isEvaluationLoading: false
      error: null
    }
  | {
      evaluation: undefined
      isEvaluationLoading: false
      error: Error
    }

// eslint-disable-next-line @typescript-eslint/ban-types -- Usage of Function is for compatibility with react-query placeholderData type
type NonFunctionGuard<T> = T extends Function ? never : T

export function useLekkoConfigDLE<E extends EvaluationType>(
  config: LekkoConfig<E>,
  options?: ConfigOptions,
): LekkoDLE<E> {
  const globalContext: ClientContext | undefined = useQuery({
    queryKey: ["lekkoGlobalContext"],
  }).data as ClientContext | undefined

  const combinedConfig = {
    ...config,
    context: getCombinedContext(globalContext, config.context),
  }

  const client = useLekkoClient()
  const defaultConfigLookup = useContext(LekkoDefaultConfigLookupProvider)
  const settings = { ...useContext(LekkoSettingsContext), ...options }

  const queryKey = createStableKey(combinedConfig, client.repository)

  const historyItem = getHistoryItem(
    combinedConfig.namespaceName,
    combinedConfig.configName,
    combinedConfig.evaluationType,
  )

  const res = useQuery<EvaluationResult<E>>({
    queryKey,
    queryFn: async () => {
      const result = await handleLekkoErrors(
        async () => await getEvaluation(client, combinedConfig),
        combinedConfig,
        client.repository,
        defaultConfigLookup,
      )
      upsertHistoryItem({
        key: queryKey,
        result,
        config: combinedConfig,
      })
      return result
    },
    ...DEFAULT_LEKKO_REFRESH,
    ...(settings.backgroundRefetch === true && historyItem !== undefined
      ? {
          // This cast is required due to TS limitations with conditional types
          // and react-query's type signatures
          placeholderData: historyItem.result as NonFunctionGuard<
            EvaluationResult<E>
          >,
        }
      : {}),
  })

  switch (res.status) {
    case "pending": {
      return {
        evaluation: res.data,
        isEvaluationLoading: true,
        error: null,
      }
    }
    case "success": {
      return {
        evaluation: res.data,
        isEvaluationLoading: false,
        error: null,
      }
    }
    case "error": {
      return {
        evaluation: undefined,
        isEvaluationLoading: false,
        error: res.error,
      }
    }
  }
}
