import { DEFAULT_LEKKO_REFRESH } from "../utils/constants"
import { getEvaluation } from "../utils/evaluation"
import { createStableKey } from "../utils/helpers"
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
) {
  const globalContext: ClientContext | undefined = useQuery({
    queryKey: ["lekkoGlobalContext"],
  }).data as ClientContext | undefined

  const client = useLekkoClient()
  const defaultConfigLookup = useContext(LekkoDefaultConfigLookupProvider)

  const query: UseSuspenseQueryOptions<
    EvaluationResult<E> | null,
    Error,
    EvaluationResult<E> | null,
    string[]
  > = {
    queryKey: [],
    queryFn: () => null,
    ...DEFAULT_LEKKO_REFRESH,
  }

  const isFn = typeof config === "function"

  if (!isFn) {
    const combinedConfig = {
      ...config,
      context: getCombinedContext(globalContext, config.context),
    }
    query.queryKey = createStableKey(combinedConfig, client.repository)
    query.queryFn = async () =>
      await handleLekkoErrors(
        async () => await getEvaluation(client, combinedConfig),
        combinedConfig,
        client.repository,
        defaultConfigLookup,
      )
  }

  const { data: evaluation } = useSuspenseQuery(query)

  if (isFn) {
    // For now, only support local execution
    return config(
      toPlainContext(
        getCombinedContext(
          globalContext,
          toClientContext(contextOrOptions as C),
        ),
      ) as C,
    )
  } else {
    const combinedConfig = {
      ...config,
      context: getCombinedContext(globalContext, config.context),
    }

    upsertHistoryItem({
      key: query.queryKey,
      // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
      result: evaluation as EvaluationResult<E>,
      config: combinedConfig,
    })
    return evaluation
  }
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
