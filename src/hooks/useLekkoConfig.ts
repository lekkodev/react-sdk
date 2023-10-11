import { useQuery } from "@tanstack/react-query"
import { DEFAULT_LEKKO_REFRESH } from "../utils/constants"
import { getEvaluation } from "../utils/evaluation"
import { createStableKey } from "../utils/helpers"
import { type LekkoConfig } from "../utils/types"
import useLekkoClient from "./useLekkoClient"

export function useLekkoConfig(config: LekkoConfig) {
  const client = useLekkoClient()
  const { data: evaluation } = useQuery({
    queryKey: createStableKey(config, client.repository),
    queryFn: async () => await getEvaluation(client, config),
    ...DEFAULT_LEKKO_REFRESH,
    suspense: true,
  })

  return evaluation
}
