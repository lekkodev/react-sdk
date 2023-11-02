import { getEvaluation } from "../utils/evaluation"
import { type EvaluationType, type LekkoConfig } from "../utils/types"
import useLekkoClient from "./useLekkoClient"

export function useLekkoConfigFetch<E extends EvaluationType>() {
  const client = useLekkoClient()

  const fetch = async (config: LekkoConfig<E>) => {
    return await getEvaluation(client, config)
  }

  return fetch
}
