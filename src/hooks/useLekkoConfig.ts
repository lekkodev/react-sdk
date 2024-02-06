import { DEFAULT_LEKKO_REFRESH } from "../utils/constants"
import { getEvaluation } from "../utils/evaluation"
import { createStableKey } from "../utils/helpers"
import {
  type ConfigOptions,
  type EvaluationType,
  type LekkoConfig,
} from "../utils/types"
import useLekkoClient from "./useLekkoClient"
import { handleLekkoErrors } from "../errors/errors"
import { useContext } from "react"
import { LekkoDefaultConfigLookupProvider } from "../providers/lekkoDefaultConfigLookupProvider"
import { useSuspenseQuery } from "@tanstack/react-query"
import { getHistoryItem, upsertHistoryItem } from "../utils/overrides"
import { LekkoSettingsContext } from "../providers/lekkoSettingsProvider"

export function useLekkoConfig<E extends EvaluationType>(
  config: LekkoConfig<E>,
  options?: ConfigOptions,
) {
  const client = useLekkoClient()
  const settings = useContext(LekkoSettingsContext)
  const defaultConfigLookup = useContext(LekkoDefaultConfigLookupProvider)
  const queryKey = createStableKey(config, client.repository)

  const historyItem = getHistoryItem(config.namespaceName, config.configName)

  const backgroundRefetch =
    options?.backgroundRefetch === undefined
      ? settings.backgroundRefetch
      : options?.backgroundRefetch

  const { data: evaluation } = useSuspenseQuery({
    queryKey,
    queryFn: async () =>
      await handleLekkoErrors(
        async () => await getEvaluation(client, config),
        config,
        client.repository,
        defaultConfigLookup,
      ),
    ...DEFAULT_LEKKO_REFRESH,
    ...(backgroundRefetch === true
      ? {
        placeholderData: historyItem?.result,
      }
      : {}),
  })

  upsertHistoryItem({
    key: queryKey,
    result: evaluation,
    config,
  })

  return evaluation
}
