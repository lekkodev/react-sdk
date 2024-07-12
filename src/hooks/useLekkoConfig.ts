import { getEvaluation } from "../utils/evaluation"
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
import { getCombinedContext, toPlainContext } from "../utils/context"
import { ClientContext } from "@lekko/js-sdk"
import { useContext, useMemo } from "react"
import { LekkoGlobalContext } from "../providers/lekkoGlobalContext"
import { LekkoOverrideContext } from "../providers/lekkoOverrideProvider"
import {
  getConfigRef,
  useActiveConfig,
} from "../providers/lekkoConfigTrackerContext"

// Overload for supporting native lang interface, where we pass functions
export function useLekkoConfig<T, C extends LekkoContext>(
  configFn: LekkoConfigFn<T, C>,
  context: C,
): T
export function useLekkoConfig<T>(configFn: LekkoConfigFn<T, LekkoContext>): T
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
  const { globalContext } = useContext(LekkoGlobalContext)
  const { overrides } = useContext(LekkoOverrideContext)

  const client = useLekkoClient()
  const configRef = getConfigRef(config)
  useActiveConfig(configRef)

  const isFn = typeof config === "function"

  const result = useMemo(() => {
    if (isFn) {
      const combinedContext = getCombinedContext(
        globalContext,
        ClientContext.fromJSON(contextOrOptions as C),
      )
      if (
        "_namespaceName" in config &&
        "_configName" in config &&
        "_evaluationType" in config
      ) {
        // Remote evaluation with function interface
        const combinedConfig = {
          namespaceName: config._namespaceName,
          configName: config._configName,
          evaluationType: config._evaluationType,
          context: combinedContext,
        }
        // TODO: History upsert
        if (
          configRef?.configName !== undefined &&
          overrides[configRef?.configName] !== undefined
        ) {
          return overrides[configRef.configName].result as
            | T
            | EvaluationResult<E>
        }

        return handleLekkoErrors(
          () => config(toPlainContext(combinedContext) as C, client),
          combinedConfig,
          client?.repository,
        )
      } else {
        if (
          configRef?.configName !== undefined &&
          overrides[configRef?.configName] !== undefined
        ) {
          return overrides[configRef?.configName].result as
            | T
            | EvaluationResult<E>
        }
        // Local evaluation with function interface
        return config(toPlainContext(combinedContext) as C)
      }
    } else {
      // Remote evaluation with object interface
      const combinedConfig = {
        ...config,
        context: getCombinedContext(globalContext, config.context),
      }
      if (
        configRef?.configName !== undefined &&
        overrides[configRef?.configName] !== undefined
      ) {
        return overrides[configRef.configName].result as T | EvaluationResult<E>
      }
      if (client === undefined) {
        throw new Error("This pathway requires a client")
      }
      return handleLekkoErrors(
        () => getEvaluation(client, combinedConfig),
        combinedConfig,
        client.repository,
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isFn,
    client,
    config,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(contextOrOptions),
    globalContext,
    overrides,
    configRef?.configName,
  ])

  return result
}

export const useLekko = useLekkoConfig

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
