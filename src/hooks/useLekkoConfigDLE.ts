import { useQuery } from "@tanstack/react-query"
import { useContext } from "react"
import { handleLekkoErrors } from "../errors/errors"
import { LekkoDefaultConfigLookupProvider } from "../providers/lekkoDefaultConfigLookupProvider"
import { DEFAULT_LEKKO_REFRESH } from "../utils/constants"
import { getEvaluation } from "../utils/evaluation"
import { createStableKey } from "../utils/helpers"
import { type EvaluationType, type LekkoConfig } from "../utils/types"
import useLekkoClient from "./useLekkoClient"
import { upsertHistoryItem } from "../providers/lekkoConfigProvider"

export function useLekkoConfigDLE<E extends EvaluationType>(
  config: LekkoConfig<E>,
) {
  const client = useLekkoClient()
  const defaultConfigLookup = useContext(LekkoDefaultConfigLookupProvider)
  const queryKey = createStableKey(config, client.repository)
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
  })

  return {
    evaluation,
    isEvaluationLoading,
    error,
  }
}
