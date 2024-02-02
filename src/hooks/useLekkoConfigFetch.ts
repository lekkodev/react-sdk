import { useContext } from "react"
import { handleLekkoErrors } from "../errors/errors"
import { LekkoDefaultConfigLookupProvider } from "../providers/lekkoDefaultConfigLookupProvider"
import { getEvaluation } from "../utils/evaluation"
import { type EvaluationType, type LekkoConfig } from "../utils/types"
import useLekkoClient from "./useLekkoClient"

export function useLekkoConfigFetch<E extends EvaluationType>() {
  const client = useLekkoClient()
  const defaultConfigLookup = useContext(LekkoDefaultConfigLookupProvider)

  const fetch = async (config: LekkoConfig<E>) => {
    return await handleLekkoErrors(
      async () => await getEvaluation(client, config),
      config,
      client.repository,
      defaultConfigLookup,
    )
  }

  return fetch
}
