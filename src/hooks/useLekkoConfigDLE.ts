import { type UseQueryOptions, useQuery } from "@tanstack/react-query"
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
  type LekkoConfigFn,
  type LekkoContext,
} from "../utils/types"
import useLekkoClient from "./useLekkoClient"
import { getHistoryItem, upsertHistoryItem } from "../utils/overrides"
import { LekkoSettingsContext } from "../providers/lekkoSettingsProvider"
import {
  getCombinedContext,
  toClientContext,
  toPlainContext,
} from "../utils/context"
import { type ClientContext } from "@lekko/js-sdk"

// Discriminated union typing for pending, success, error states
export type LekkoDLE<T> =
  | {
      evaluation?: T
      isEvaluationLoading: true
      error: null
    }
  | {
      evaluation: T
      isEvaluationLoading: false
      error: null
    }
  | {
      evaluation: undefined
      isEvaluationLoading: false
      error: Error
    }

// eslint-disable-next-line @typescript-eslint/ban-types -- Usage of Function is for compatibility with react-query placeholderData type
type NonFunctionGuard<T> = T extends Function ? never : T

// Overload for supporting native lang interface, where we pass functions
export function useLekkoConfigDLE<T, C extends LekkoContext>(
  configFn: LekkoConfigFn<T, C>,
  context?: LekkoContext,
): LekkoDLE<T>
export function useLekkoConfigDLE<E extends EvaluationType>(
  config: LekkoConfig<E>,
  options?: ConfigOptions,
): LekkoDLE<EvaluationResult<E>>
export function useLekkoConfigDLE<
  T,
  C extends LekkoContext,
  E extends EvaluationType,
>(
  config: LekkoConfig<E> | LekkoConfigFn<T, C>,
  contextOrOptions?: C | ConfigOptions,
) {
  const globalContext: ClientContext | undefined = useQuery({
    queryKey: ["lekkoGlobalContext"],
  }).data as ClientContext | undefined

  const client = useLekkoClient()
  const defaultConfigLookup = useContext(LekkoDefaultConfigLookupProvider)
  let settings = useContext(LekkoSettingsContext)

  const query: UseQueryOptions<
    EvaluationResult<E>,
    Error,
    EvaluationResult<E>,
    string[]
  > = {
    queryKey: [],
    ...DEFAULT_LEKKO_REFRESH,
  }

  const isFn = typeof config === "function"

  if (!isFn) {
    const combinedConfig = {
      ...config,
      context: getCombinedContext(globalContext, config.context),
    }
    settings = { ...settings, ...contextOrOptions }

    query.queryKey = createStableKey(combinedConfig, client.repository)
    query.queryFn = async () => {
      const result = await handleLekkoErrors(
        async () => await getEvaluation(client, combinedConfig),
        combinedConfig,
        client.repository,
        defaultConfigLookup,
      )
      upsertHistoryItem({
        key: query.queryKey,
        result,
        config: combinedConfig,
      })
      return result
    }

    const historyItem = getHistoryItem(
      combinedConfig.namespaceName,
      combinedConfig.configName,
      combinedConfig.evaluationType,
    )

    if (settings.backgroundRefetch === true && historyItem !== undefined) {
      // This cast is required due to TS limitations with conditional types
      // and react-query's type signatures
      query.placeholderData = historyItem.result as NonFunctionGuard<
        EvaluationResult<E>
      >
    }
  }

  const res = useQuery(query)

  if (isFn) {
    // For now, only support local execution
    return {
      evaluation: config(
        toPlainContext(
          getCombinedContext(
            globalContext,
            toClientContext(contextOrOptions as C),
          ),
        ) as C,
      ),
      isEvaluationLoading: false,
      error: null,
    }
  }

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
