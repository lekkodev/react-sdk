import { handleLekkoErrors } from "../errors/errors"
import { queryClient } from "../providers/lekkoConfigProvider"
import { DEFAULT_LOOKUP_KEY } from "../utils/constants"
import { getEvaluation } from "../utils/evaluation"
import { type EvaluationType, type LekkoConfig } from "../utils/types"
import useLekkoClient from "./useLekkoClient"

export function useLekkoConfigFetch<E extends EvaluationType>() {
  const client = useLekkoClient()

  const fetch = async (config: LekkoConfig<E>) => {
    return await handleLekkoErrors(
      async () => await getEvaluation(client, config),
      config,
      client.repository,
      queryClient.getQueryData(DEFAULT_LOOKUP_KEY),
    )
  }

  return fetch
}
