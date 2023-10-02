import { useQuery } from "react-query"
import { DEFAULT_REFRESH } from "../utils/constants"
import { getEvaluation } from "../utils/evaluation"
import { createStableKey } from "../utils/helpers"
import { type LekkoConfig } from "../utils/types"
import useLekkoClient from "./useLekkoClient"

export function useLekkoConfigDLE(config: LekkoConfig) {
  const client = useLekkoClient()
  const { data: evaluation, isLoading: isEvaluationLoading } = useQuery(
    createStableKey(config),
    async () => await getEvaluation(client, config),
    DEFAULT_REFRESH,
  )

  return {
    evaluation,
    isEvaluationLoading,
  }
}
