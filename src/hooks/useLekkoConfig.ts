import { DEFAULT_LEKKO_REFRESH } from "../utils/constants"
import { getEvaluation } from "../utils/evaluation"
import { createStableKey } from "../utils/helpers"
import {
  EvaluationType,
  type ConfigOptions,
  type LekkoConfig,
  type UntypedLekkoConfig,
  type EvaluationResult,
} from "../utils/types"
import useLekkoClient from "./useLekkoClient"
import { handleLekkoErrors } from "../errors/errors"
import { useContext } from "react"
import { LekkoDefaultConfigLookupProvider } from "../providers/lekkoDefaultConfigLookupProvider"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { upsertHistoryItem } from "../utils/overrides"
import { LekkoSettingsContext } from "../providers/lekkoSettingsProvider"
import { getCombinedContext } from "../utils/context"
import { type ClientContext } from "@lekko/js-sdk"
import type * as t from "io-ts"

export function useLekkoConfig<E extends EvaluationType>(
  config: LekkoConfig<E>,
  options?: ConfigOptions,
) {
  const globalContext: ClientContext | undefined = useQuery({
    queryKey: ["lekkoGlobalContext"],
  }).data as ClientContext | undefined

  const combinedConfig = {
    ...config,
    context: getCombinedContext(globalContext, config.context),
  }

  const client = useLekkoClient()
  const settings = { ...useContext(LekkoSettingsContext), ...options }
  const defaultConfigLookup = useContext(LekkoDefaultConfigLookupProvider)
  const queryKey = createStableKey(combinedConfig, client.repository)

  const { data: evaluation } = useSuspenseQuery<EvaluationResult<E>>({
    queryKey,
    queryFn: async () =>
      await handleLekkoErrors(
        async () => await getEvaluation(client, combinedConfig),
        combinedConfig,
        client.repository,
        defaultConfigLookup,
      ),
    ...DEFAULT_LEKKO_REFRESH,
    ...(settings.backgroundRefetch === true
      ? {
          placeholderData: (previousData: EvaluationResult<E> | undefined) =>
            previousData,
        }
      : {}),
  })

  upsertHistoryItem({
    key: queryKey,
    result: evaluation,
    config: combinedConfig,
  })

  return evaluation
}

/**
 * A convenience wrapper for {@link useLekkoConfig} that is specifically for using boolean configs.
 */
export function useBoolConfig(
  config: UntypedLekkoConfig,
  options?: ConfigOptions,
) {
  return useLekkoConfig(
    { ...config, evaluationType: EvaluationType.BOOL },
    options,
  )
}

/**
 * A convenience wrapper for {@link useLekkoConfig} that is specifically for using string configs.
 */
export function useStringConfig(
  config: UntypedLekkoConfig,
  options?: ConfigOptions,
) {
  return useLekkoConfig(
    { ...config, evaluationType: EvaluationType.STRING },
    options,
  )
}

/**
 * A convenience wrapper for {@link useLekkoConfig} that is specifically for using int configs.
 */
export function useIntConfig(
  config: UntypedLekkoConfig,
  options?: ConfigOptions,
) {
  return useLekkoConfig(
    { ...config, evaluationType: EvaluationType.INT },
    options,
  )
}

/**
 * A convenience wrapper for {@link useLekkoConfig} that is specifically for using float configs.
 */
export function useFloatConfig(
  config: UntypedLekkoConfig,
  options?: ConfigOptions,
) {
  return useLekkoConfig(
    { ...config, evaluationType: EvaluationType.FLOAT },
    options,
  )
}

/**
 * A convenience wrapper for {@link useLekkoConfig} that is specifically for using JSON configs.
 */
export function useJSONConfig(
  config: UntypedLekkoConfig,
  options?: ConfigOptions,
) {
  return useLekkoConfig(
    { ...config, evaluationType: EvaluationType.JSON },
    options,
  )
}

/**
 * A convenience wrapper for {@link useLekkoConfig} that is specifically for using protobuf configs.
 */
export function useProtoConfig(
  config: UntypedLekkoConfig,
  options?: ConfigOptions,
) {
  return useLekkoConfig(
    { ...config, evaluationType: EvaluationType.PROTO },
    options,
  )
}

export function useTypedJSONConfig<A>(
  config: UntypedLekkoConfig,
  type: t.Type<A>,
  options?: ConfigOptions,
) {
  const result = useLekkoConfig(
    { ...config, evaluationType: EvaluationType.JSON },
    options,
  )
  const evaluation = type.decode(result)

  if (evaluation._tag === "Left") {
    const errorMessage = evaluation.left
      .map((validationError) => validationError.message)
      .join("\n")

    const error = new Error(errorMessage)

    throw error
  }

  return evaluation.right
}
