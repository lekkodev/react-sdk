import { useQuery } from "@tanstack/react-query"
import { useContext } from "react"
import { handleLekkoErrors } from "../errors/errors"
import { LekkoDefaultConfigLookupProvider } from "../providers/lekkoDefaultConfigLookupProvider"
import { DEFAULT_LEKKO_REFRESH } from "../utils/constants"
import { getEvaluation } from "../utils/evaluation"
import { createStableKey } from "../utils/helpers"
import {
  type EvaluationResult,
  type ConfigOptions,
  EvaluationType,
  type LekkoConfig,
  type UntypedLekkoConfig,
  type NonFunctionGuard,
} from "../utils/types"
import useLekkoClient from "./useLekkoClient"
import { upsertHistoryItem } from "../utils/overrides"
import { LekkoSettingsContext } from "../providers/lekkoSettingsProvider"
import { getCombinedContext } from "../utils/context"
import { type ClientContext } from "@lekko/js-sdk"

// Discriminated union typing for pending, success, error states
export type LekkoDLE<E extends EvaluationType> =
  | {
      evaluation?: EvaluationResult<E>
      isEvaluationLoading: true
      error: null
    }
  | {
      evaluation: EvaluationResult<E>
      isEvaluationLoading: false
      error: null
    }
  | {
      evaluation: undefined
      isEvaluationLoading: false
      error: Error
    }

export function useLekkoConfigDLE<E extends EvaluationType>(
  config: LekkoConfig<E>,
  options?: ConfigOptions,
): LekkoDLE<E> {
  const globalContext: ClientContext | undefined = useQuery({
    queryKey: ["lekkoGlobalContext"],
  }).data as ClientContext | undefined

  const combinedConfig = {
    ...config,
    context: getCombinedContext(globalContext, config.context),
  }

  const client = useLekkoClient()
  const defaultConfigLookup = useContext(LekkoDefaultConfigLookupProvider)
  const settings = { ...useContext(LekkoSettingsContext), ...options }

  const queryKey = createStableKey(combinedConfig, client.repository)

  const res = useQuery<EvaluationResult<E>>({
    queryKey,
    queryFn: async () => {
      const result = await handleLekkoErrors(
        async () => await getEvaluation(client, combinedConfig),
        combinedConfig,
        client.repository,
        defaultConfigLookup,
      )
      upsertHistoryItem({
        key: queryKey,
        result,
        config: combinedConfig,
      })
      return result
    },
    ...DEFAULT_LEKKO_REFRESH,
    ...(settings.backgroundRefetch === true
      ? {
          placeholderData: (previousData) =>
            previousData as NonFunctionGuard<EvaluationResult<E>>,
        }
      : {}),
  })

  switch (res.status) {
    case "pending": {
      return {
        evaluation: res.data,
        isEvaluationLoading: true,
        error: null,
      }
    }
    case "success": {
      return {
        evaluation: res.data,
        isEvaluationLoading: false,
        error: null,
      }
    }
    case "error": {
      return {
        evaluation: undefined,
        isEvaluationLoading: false,
        error: res.error,
      }
    }
  }
}

/**
 * A convenience wrapper for {@link useLekkoConfigDLE} that is specifically for using boolean configs.
 */
export function useBoolConfigDLE(
  config: UntypedLekkoConfig,
  options?: ConfigOptions,
) {
  return useLekkoConfigDLE(
    { ...config, evaluationType: EvaluationType.BOOL },
    options,
  )
}

/**
 * A convenience wrapper for {@link useLekkoConfigDLE} that is specifically for using string configs.
 */
export function useStringConfigDLE(
  config: UntypedLekkoConfig,
  options?: ConfigOptions,
) {
  return useLekkoConfigDLE(
    { ...config, evaluationType: EvaluationType.STRING },
    options,
  )
}

/**
 * A convenience wrapper for {@link useLekkoConfigDLE} that is specifically for using int configs.
 */
export function useIntConfigDLE(
  config: UntypedLekkoConfig,
  options?: ConfigOptions,
) {
  return useLekkoConfigDLE(
    { ...config, evaluationType: EvaluationType.INT },
    options,
  )
}

/**
 * A convenience wrapper for {@link useLekkoConfigDLE} that is specifically for using float configs.
 */
export function useFloatConfigDLE(
  config: UntypedLekkoConfig,
  options?: ConfigOptions,
) {
  return useLekkoConfigDLE(
    { ...config, evaluationType: EvaluationType.FLOAT },
    options,
  )
}

/**
 * A convenience wrapper for {@link useLekkoConfigDLE} that is specifically for using JSON configs.
 */
export function useJSONConfigDLE(
  config: UntypedLekkoConfig,
  options?: ConfigOptions,
) {
  return useLekkoConfigDLE(
    { ...config, evaluationType: EvaluationType.JSON },
    options,
  )
}

/**
 * A convenience wrapper for {@link useLekkoConfigDLE} that is specifically for using protobuf configs.
 */
export function useProtoConfigDLE(
  config: UntypedLekkoConfig,
  options?: ConfigOptions,
) {
  return useLekkoConfigDLE(
    { ...config, evaluationType: EvaluationType.PROTO },
    options,
  )
}
