import React, {
  useContext,
  useEffect,
  createContext,
  type Dispatch,
  type SetStateAction,
} from "react"
import { camelToKebabCase } from "../utils/helpers"
import {
  type LekkoConfig,
  type LekkoConfigFn,
  type LekkoContext,
  type ConfigRef,
} from "../utils/types"

function getConfigRef<T, C extends LekkoContext>(
  config: LekkoConfigFn<T, C> | LekkoConfig,
): ConfigRef | undefined {
  if (typeof config === "function" && "_namespaceName" in config) {
    if (config._namespaceName !== "" && config._configName !== "") {
      return {
        namespaceName: config._namespaceName,
        configName: config._configName,
      }
    } else if (config.name !== "") {
      const casedName = camelToKebabCase(config.name)
      return {
        namespaceName: "frontend", // need the namespace here
        configName: casedName,
      }
    }
  } else if (typeof config === "object") {
    return config.namespaceName !== "" && config.configName !== ""
      ? {
          namespaceName: config.namespaceName,
          configName: config.configName,
        }
      : undefined
  }
  return undefined
}

const LekkoConfigTrackerContext = createContext<{
  activeConfigs: ConfigRef[]
  registerConfig: (config: ConfigRef) => void
  unregisterConfig: (config: ConfigRef) => void
}>({
  activeConfigs: [],
  registerConfig: () => {},
  unregisterConfig: () => {},
})

interface ProviderProps {
  children: React.ReactNode
  activeConfigs: ConfigRef[]
  setActiveConfigs: Dispatch<SetStateAction<ConfigRef[]>>
}

function LekkoConfigTrackerProvider({
  children,
  activeConfigs,
  setActiveConfigs,
}: ProviderProps) {
  const registerConfig = (config: ConfigRef) => {
    setActiveConfigs((prev) => {
      const exists = prev.some(
        (c) =>
          c.configName === config.configName &&
          c.namespaceName === config.namespaceName,
      )
      if (!exists) {
        return [...prev, config]
      }
      return prev
    })
  }

  const unregisterConfig = (config: ConfigRef) => {
    setActiveConfigs((prev) =>
      prev.filter(
        (c) =>
          c.configName !== config.configName ||
          c.namespaceName !== config.namespaceName,
      ),
    )
  }

  return (
    <LekkoConfigTrackerContext.Provider
      value={{ activeConfigs, registerConfig, unregisterConfig }}
    >
      {children}
    </LekkoConfigTrackerContext.Provider>
  )
}

function useActiveConfig(configRef: ConfigRef | undefined) {
  const { registerConfig, unregisterConfig } = useContext(
    LekkoConfigTrackerContext,
  )

  useEffect(() => {
    if (configRef !== undefined) registerConfig(configRef)

    return () => {
      if (configRef !== undefined) unregisterConfig(configRef)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(configRef)])
}

export {
  getConfigRef,
  LekkoConfigTrackerProvider,
  useActiveConfig,
  LekkoConfigTrackerContext,
}
