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

export function useLekkoConfigDLE<E extends EvaluationType>(
  config: LekkoConfig<E>,
  options?: ConfigOptions,
) {
  const client = useLekkoClient()
  const defaultConfigLookup = useContext(LekkoDefaultConfigLookupProvider)
  const settings = useContext(LekkoSettingsContext)

  const queryKey = createStableKey(config, client.repository)

  const historyItem = getHistoryItem(config.namespaceName, config.configName)
  const backgroundRefetch =
    options?.backgroundRefetch === undefined
      ? settings.backgroundRefetch
      : options.backgroundRefetch

  const {
    data: evaluation,
    isLoading: isEvaluationLoading,
    error,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await handleLekkoErrors(
        async () => await getEvaluation(client, config),
        config,
        client.repository,
        defaultConfigLookup,
      )
      upsertHistoryItem({
        key: queryKey,
        result,
        config,
      })
      return result
    },
    ...DEFAULT_LEKKO_REFRESH,
    ...(backgroundRefetch === true
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
