import { useQuery } from "@tanstack/react-query"
import { useContext } from "react"
import { handleLekkoErrors } from "../errors/errors"
import { LekkoDefaultConfigLookupProvider } from "../providers/lekkoDefaultConfigLookupProvider"
import { DEFAULT_LEKKO_REFRESH } from "../utils/constants"
import { getEvaluation } from "../utils/evaluation"
import { createStableKey } from "../utils/helpers"
import {
  type ConfigOptions,
  type EvaluationType,
  type LekkoConfig,
} from "../utils/types"
import useLekkoClient from "./useLekkoClient"
import { getHistoryItem, upsertHistoryItem } from "../utils/overrides"
import { LekkoSettingsContext } from "../providers/lekkoSettingsProvider"
import { getCombinedContext } from "../utils/context"
import { type ClientContext } from "@lekko/js-sdk"

export function useLekkoConfigDLE<E extends EvaluationType>(
  config: LekkoConfig<E>,
  options?: ConfigOptions,
) {
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
  )
  const {
    data: evaluation,
    isLoading: isEvaluationLoading,
    error,
  } = useQuery({
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
    ...(settings.backgroundRefetch === true
      ? {
        placeholderData: historyItem?.result,
      }
      : {}),
  })

  return {
    evaluation,
    isEvaluationLoading,
    error,
  }
}
