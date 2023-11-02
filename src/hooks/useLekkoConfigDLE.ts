import { useQuery } from "@tanstack/react-query"
import { DEFAULT_LEKKO_REFRESH } from "../utils/constants"
import { getEvaluation } from "../utils/evaluation"
import { createStableKey } from "../utils/helpers"
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
    queryFn: async () => await getEvaluation(client, config),
    ...DEFAULT_LEKKO_REFRESH,
  })

  return {
    evaluation,
    isEvaluationLoading,
    error,
  }
}
