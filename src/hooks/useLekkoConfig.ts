import { DEFAULT_LEKKO_REFRESH } from "../utils/constants"
import { getEvaluation } from "../utils/evaluation"
import { createStableKey } from "../utils/helpers"
import {
  type EvaluationType,
  type ConfigOptions,
  type LekkoConfig,
} from "../utils/types"
import useLekkoClient from "./useLekkoClient"
import { handleLekkoErrors } from "../errors/errors"
import { useContext } from "react"
import { LekkoDefaultConfigLookupProvider } from "../providers/lekkoDefaultConfigLookupProvider"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { getHistoryItem, upsertHistoryItem } from "../utils/overrides"
import { LekkoSettingsContext } from "../providers/lekkoSettingsProvider"
import { getCombinedContext } from "../utils/context"
import { type ClientContext } from "@lekko/js-sdk"

export function useLekkoConfig<E extends EvaluationType>(
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
  const settings = { ...useContext(LekkoSettingsContext), ...options }
  const defaultConfigLookup = useContext(LekkoDefaultConfigLookupProvider)
  const queryKey = createStableKey(combinedConfig, client.repository)

  const historyItem = getHistoryItem(
    combinedConfig.namespaceName,
    combinedConfig.configName,
    combinedConfig.evaluationType,
  )

  const { data: evaluation } = useSuspenseQuery({
    queryKey,
    queryFn: async () =>
      await handleLekkoErrors(
        async () => await getEvaluation(client, combinedConfig),
        combinedConfig,
        client.repository,
        defaultConfigLookup,
      ),
    ...DEFAULT_LEKKO_REFRESH,
    ...(settings.backgroundRefetch === true
      ? {
          placeholderData: historyItem?.result,
        }
      : {}),
  })

  upsertHistoryItem({
    key: queryKey,
    result: evaluation,
    config: combinedConfig,
  })

  return evaluation
}
