import { handleLekkoErrors } from "../errors/errors"
import { queryClient } from "../providers/lekkoConfigProvider"
import { DEFAULT_LOOKUP_KEY } from "../utils/constants"
import { getEvaluation } from "../utils/evaluation"
import { createDefaultStableKey } from "../utils/helpers"
import { type LekkoConfig } from "../utils/types"
import useLekkoClient from "./useLekkoClient"

export function useLekkoConfigFetch() {
  const client = useLekkoClient()

  const fetch = async (config: LekkoConfig) => {
    return await handleLekkoErrors(
      async () => await getEvaluation(client, config),
      createDefaultStableKey(config, client.repository),
      queryClient.getQueryData(DEFAULT_LOOKUP_KEY),
    )
  }

  return fetch
}
