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
import { upsertHistoryItem } from "../utils/overrides"
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

// Overload for supporting native lang interface, where we pass functions
export function useLekkoConfigDLE<T, C extends LekkoContext>(
  configFn: LekkoConfigFn<T, C>,
  context?: LekkoContext,
  options?: ConfigOptions,
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
  options?: ConfigOptions,
): LekkoDLE<T> | LekkoDLE<EvaluationResult<E>> {
  const globalContext: ClientContext | undefined = useQuery({
    queryKey: ["lekkoGlobalContext"],
  }).data as ClientContext | undefined

  const client = useLekkoClient()
  const defaultConfigLookup = useContext(LekkoDefaultConfigLookupProvider)
  let settings = useContext(LekkoSettingsContext)

  const query: UseQueryOptions<
    EvaluationResult<E> | T,
    Error,
    EvaluationResult<E> | T,
    string[]
  > = {
    queryKey: [],
    ...DEFAULT_LEKKO_REFRESH,
  }

  const isFn = typeof config === "function"

  if (isFn) {
    settings = { ...settings, ...options }
    const combinedContext = getCombinedContext(
      globalContext,
      toClientContext(contextOrOptions as C),
    )
    if (
      config._namespaceName !== undefined &&
      config._configName !== undefined &&
      config._evaluationType !== undefined
    ) {
      // Remote evaluation with function interface
      const combinedConfig = {
        namespaceName: config._namespaceName,
        configName: config._configName,
        evaluationType: config._evaluationType,
        context: combinedContext,
      }
      query.queryKey = createStableKey(combinedConfig, client.repository)
      // TODO: History upsert
      query.queryFn = async () =>
        await handleLekkoErrors(
          async () =>
            await config(toPlainContext(combinedContext) as C, client),
          combinedConfig,
          client.repository,
          defaultConfigLookup,
        )
    } else {
      // Local evaluation with function interface
      query.staleTime = 0 // Invalidate cache immediately (since we have no cache key and don't want to cache this)
      query.queryFn = async () =>
        await config(toPlainContext(combinedContext) as C)
    }
  } else {
    // Remote evaluation with object interface
    settings = { ...settings, ...contextOrOptions }
    const combinedConfig = {
      ...config,
      context: getCombinedContext(globalContext, config.context),
    }

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
    if (settings.backgroundRefetch === true) {
      query.placeholderData = (previousData) => previousData
    }
  }

  const res = useQuery(query)

  switch (res.status) {
    case "pending": {
      return {
        evaluation: res.data,
        isEvaluationLoading: true,
        error: null,
      }
    }
    case "success": {
      if (isFn) {
        return {
          evaluation: res.data as T,
          isEvaluationLoading: false,
          error: null,
        }
      } else {
        return {
          evaluation: res.data as EvaluationResult<E>,
          isEvaluationLoading: false,
          error: null,
        }
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
