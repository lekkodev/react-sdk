import { DEFAULT_LEKKO_REFRESH } from "../utils/constants"
import { getEvaluation } from "../utils/evaluation"
import { createStableKey } from "../utils/helpers"
import { type EvaluationType, type LekkoConfig } from "../utils/types"
import useLekkoClient from "./useLekkoClient"
import { handleLekkoErrors } from "../errors/errors"
import { useContext } from "react"
import { LekkoDefaultConfigLookupProvider } from "../providers/lekkoDefaultConfigLookupProvider"
import { useSuspenseQuery } from "@tanstack/react-query"
import { upsertHistoryItem } from "../utils/overrides"

export function useLekkoConfig<E extends EvaluationType>(
  config: LekkoConfig<E>,
) {
  const client = useLekkoClient()
  const defaultConfigLookup = useContext(LekkoDefaultConfigLookupProvider)
  const queryKey = createStableKey(config, client.repository)
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
  })

  upsertHistoryItem({
    key: queryKey,
    result: evaluation,
    config,
  })

  return evaluation
}
