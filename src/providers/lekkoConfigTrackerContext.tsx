import React, { useContext, useEffect, createContext, Dispatch, SetStateAction } from 'react';
import { camelToKebabCase } from '../utils/helpers';
import { ConfigRef } from '../utils/types'

function getConfigRef(config: any): ConfigRef | undefined {
    if (typeof config === "function") {
        if (config._namespaceName && config._configName) {
            return {
                namespaceName: config._namespaceName,
                configName: config._configName
            };
        } else if (config.name) {
            const casedName = camelToKebabCase(config.name);
            return {
                namespaceName: "frontend", // need the namespace here
                configName: casedName
            };
        }
    } else if (typeof config === "object") {
        return config.namespaceName && config.configName ? {
            namespaceName: config.namespaceName,
            configName: config.configName
        } : undefined;
    }
    return undefined;
}

const LekkoConfigTrackerContext = createContext<{
    activeConfigs: ConfigRef[],
    registerConfig: (config: ConfigRef) => void,
    unregisterConfig: (config: ConfigRef) => void
}>({
    activeConfigs: [],
    registerConfig: () => {},
    unregisterConfig: () => {}
});

interface ProviderProps {
    children: React.ReactNode
    activeConfigs: ConfigRef[]
    setActiveConfigs: Dispatch<SetStateAction<ConfigRef[]>>
}


function LekkoConfigTrackerProvider({ children, activeConfigs, setActiveConfigs }: ProviderProps) {
    const registerConfig = (config: ConfigRef) => {
        setActiveConfigs(prev => [...prev, config]);
    };

    console.log(activeConfigs)

    const unregisterConfig = (config: ConfigRef) => {
        setActiveConfigs(prev => prev.filter(c => 
            c.configName !== config.configName || c.namespaceName !== config.namespaceName
        ));
    };

    return (
        <LekkoConfigTrackerContext.Provider value={{ activeConfigs, registerConfig, unregisterConfig }}>
            {children}
        </LekkoConfigTrackerContext.Provider>
    );
}

function useActiveConfig(configRef: ConfigRef | undefined) {
    const { registerConfig, unregisterConfig } = useContext(LekkoConfigTrackerContext);

    useEffect(() => {
        console.log('in use effect for hook')
        console.log(configRef)
        if (configRef !== undefined) registerConfig(configRef);

        return () => {
            if (configRef !== undefined) unregisterConfig(configRef);
        };
    }, []);
}

export { getConfigRef, LekkoConfigTrackerProvider, useActiveConfig, LekkoConfigTrackerContext };
