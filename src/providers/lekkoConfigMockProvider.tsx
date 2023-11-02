import { type Client, RepositoryKey } from "@lekko/js-sdk"
import { createContext, useMemo, type PropsWithChildren } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  type EvaluationType,
  type ResolvedLekkoConfig,
  type LekkoSettings,
} from "../utils/types"
import { DEFAULT_LEKKO_SETTINGS } from "../utils/constants"
import { createMockClient } from "../mockHelpers/createMockClient"
import { getEnvironmentVariable } from "../utils/envHelpers"

const queryClient = new QueryClient()

export const LekkoConfigMockClientContext = createContext<Client | undefined>(
  undefined,
)

interface InitProps extends PropsWithChildren {
  settings?: LekkoSettings
  defaultConfigs: Array<ResolvedLekkoConfig<EvaluationType>>
}

function init({
  settings = DEFAULT_LEKKO_SETTINGS,
  defaultConfigs,
}: InitProps): Client {
  const repositoryOwner =
    settings?.repositoryOwner ?? getEnvironmentVariable("REPOSITORY_OWNER")
  const repositoryName =
    settings?.repositoryName ?? getEnvironmentVariable("REPOSITORY_NAME")

  if (repositoryOwner === undefined || repositoryName === undefined) {
    throw new Error("Missing Lekko repository env values")
  }

  const repositoryKey = RepositoryKey.fromJson({
    ownerName: repositoryOwner,
    repoName: repositoryName,
  })

  return createMockClient({
    repositoryKey,
    defaultConfigs,
  })
}

interface MockProps extends PropsWithChildren {
  settings?: LekkoSettings
  defaultConfigs: Array<ResolvedLekkoConfig<EvaluationType>>
}

export function LekkoConfigMockProvider({
  settings,
  defaultConfigs,
  children,
}: MockProps) {
  const client = useMemo(
    () => init({ settings, defaultConfigs }),
    [settings, defaultConfigs],
  )
  return (
    <LekkoConfigMockClientContext.Provider value={client}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </LekkoConfigMockClientContext.Provider>
  )
}
