import { useQuery } from "@tanstack/react-query"
import { handleLekkoErrors } from "../errors/errors"
import { queryClient } from "../providers/lekkoConfigProvider"
import { DEFAULT_LEKKO_REFRESH, DEFAULT_LOOKUP_KEY } from "../utils/constants"
import { getEvaluation } from "../utils/evaluation"
import { createDefaultStableKey, createStableKey } from "../utils/helpers"
import { type EvaluationType, type LekkoConfig } from "../utils/types"
import useLekkoClient from "./useLekkoClient"

export function useLekkoConfigDLE<E extends EvaluationType>(
  config: LekkoConfig<E>,
) {
  const client = useLekkoClient()
  const {
    data: evaluation,
    isLoading: isEvaluationLoading,
    error,
  } = useQuery({
    queryKey: createStableKey(config, client.repository),
    queryFn: async () =>
      await handleLekkoErrors(
        async () => await getEvaluation(client, config),
        createDefaultStableKey(config, client.repository),
        queryClient.getQueryData(DEFAULT_LOOKUP_KEY),
      ),
    ...DEFAULT_LEKKO_REFRESH,
  })

  return {
    evaluation,
    isEvaluationLoading,
    error,
  }
}
