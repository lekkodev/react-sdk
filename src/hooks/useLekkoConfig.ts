import { useQuery } from "react-query"
import { DEFAULT_REFRESH } from "../utils/constants"
import { getEvaluation } from "../utils/evaluation"
import { createStableKey } from "../utils/helpers"
import { type LekkoConfig } from "../utils/types"
import useLekkoClient from "./useLekkoClient"

export function useLekkoConfig(config: LekkoConfig) {
  const client = useLekkoClient()
  const { data: evaluation } = useQuery(
    createStableKey(config),
    async () => await getEvaluation(client, config),
    { suspense: true, ...DEFAULT_REFRESH },
  )

  return evaluation
}
