import { getEvaluation } from "../utils/evaluation"
import { type LekkoConfig } from "../utils/types"
import useLekkoClient from "./useLekkoClient"

export function useLekkoConfigFetch() {
  const client = useLekkoClient()

  const fetch = async (config: LekkoConfig) => {
    return await getEvaluation(client, config)
  }

  return fetch
}
