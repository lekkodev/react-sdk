import { DEFAULT_LEKKO_REFRESH } from "../utils/constants"
import { getEvaluation } from "../utils/evaluation"
import { createStableKey } from "../utils/helpers"
import { type LekkoConfig } from "../utils/types"
import useLekkoClient from "./useLekkoClient"
import { useSuspenseQuery } from "@suspensive/react-query"

export function useLekkoConfig(config: LekkoConfig) {
  const client = useLekkoClient()
  const { data: evaluation } = useSuspenseQuery({
    queryKey: createStableKey(config, client.repository),
    queryFn: async () => await getEvaluation(client, config),
    ...DEFAULT_LEKKO_REFRESH,
    onError: (error) => {
      console.log(error)
    }
  })

  return evaluation
}
