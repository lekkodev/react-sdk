import { useContext } from "react"
import { handleLekkoErrorsAsync } from "../errors/errors"
import { LekkoDefaultConfigLookupProvider } from "../providers/lekkoDefaultConfigLookupProvider"
import { getEvaluation, getRemoteEvaluation } from "../utils/evaluation"
import { type EvaluationType, type LekkoConfig } from "../utils/types"
import useLekkoRemoteClient from "./useLekkoRemoteClient"

export function useLekkoConfigFetch<E extends EvaluationType>() {
  const client = useLekkoRemoteClient()
  const defaultConfigLookup = useContext(LekkoDefaultConfigLookupProvider)

  const fetch = async (config: LekkoConfig<E>) => {
    return await handleLekkoErrorsAsync(
      async () => await getRemoteEvaluation(client, config),
      config,
      client.repository,
      defaultConfigLookup,
    )
  }

  return fetch
}
