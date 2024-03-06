import { DEFAULT_LEKKO_REFRESH } from "../utils/constants"
import { getEvaluation } from "../utils/evaluation"
import { createContextKey, createStableKey } from "../utils/helpers"
import {
  EvaluationType,
  type ConfigOptions,
  type LekkoConfig,
  type UntypedLekkoConfig,
  type LekkoContext,
  type LekkoConfigFn,
  type EvaluationResult,
} from "../utils/types"
import useLekkoClient from "./useLekkoClient"
import { handleLekkoErrors } from "../errors/errors"
import { useContext } from "react"
import { LekkoDefaultConfigLookupProvider } from "../providers/lekkoDefaultConfigLookupProvider"
import {
  type UseSuspenseQueryOptions,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { upsertHistoryItem } from "../utils/overrides"
import {
  getCombinedContext,
  toClientContext,
  toPlainContext,
} from "../utils/context"
import { type ClientContext } from "@lekko/js-sdk"

// Overload for supporting native lang interface, where we pass functions
export function useLekkoConfig<T, C extends LekkoContext>(
  configFn: LekkoConfigFn<T, C>,
  context?: LekkoContext,
): T
export function useLekkoConfig<E extends EvaluationType>(
  config: LekkoConfig<E>,
  options?: ConfigOptions,
): EvaluationResult<E>
export function useLekkoConfig<
  T,
  C extends LekkoContext,
  E extends EvaluationType,
>(
  config: LekkoConfig<E> | LekkoConfigFn<T, C>,
  contextOrOptions?: C | ConfigOptions,
): T | EvaluationResult<E> {
  const globalContext: ClientContext | undefined = useQuery({
    queryKey: ["lekkoGlobalContext"],
  }).data as ClientContext | undefined

  const client = useLekkoClient()
  const defaultConfigLookup = useContext(LekkoDefaultConfigLookupProvider)

  const query: UseSuspenseQueryOptions<
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
      query.queryKey = [config.toString(), createContextKey(combinedContext)] // HACK: we don't have good config info in local
      query.gcTime = 0
      query.staleTime = 0 // Invalidate cache immediately (since we have no cache key and don't want to cache this)
      query.queryFn = async () =>
        await config(toPlainContext(combinedContext) as C)
    }
  } else {
    // Remote evaluation with object interface
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
  }

  const { data: evaluation } = useSuspenseQuery(query)

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
