import { DEFAULT_LEKKO_REFRESH, DEFAULT_LOOKUP_KEY } from "../utils/constants"
import { getEvaluation } from "../utils/evaluation"
import { createDefaultStableKey, createStableKey } from "../utils/helpers"
import { type EvaluationType, type LekkoConfig } from "../utils/types"
import useLekkoClient from "./useLekkoClient"
import { useSuspenseQuery } from "@suspensive/react-query"
import { handleLekkoErrors } from "../errors/errors"
import { queryClient } from "../providers/lekkoConfigProvider"

export function useLekkoConfig<E extends EvaluationType>(
  config: LekkoConfig<E>,
) {
  const client = useLekkoClient()
  const { data: evaluation } = useSuspenseQuery({
    queryKey: createStableKey(config, client.repository),
    queryFn: async () =>
      await handleLekkoErrors(
        async () => await getEvaluation(client, config),
        createDefaultStableKey(config, client.repository),
        queryClient.getQueryData(DEFAULT_LOOKUP_KEY),
      ),
    ...DEFAULT_LEKKO_REFRESH,
  })

  return evaluation
}
