import { type Client, RepositoryKey } from "@lekko/js-sdk"
import { useRef, type PropsWithChildren } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  type EvaluationType,
  type ResolvedLekkoConfig,
  type LekkoSettings,
} from "../utils/types"
import {
  DEFAULT_LEKKO_REFRESH,
  DEFAULT_LEKKO_SETTINGS,
} from "../utils/constants"
import { createMockClient } from "../mockHelpers/createMockClient"
import { LekkoRemoteClientContext } from "./lekkoClientContext"
import {
  getRepositoryNameFromEnv,
  getRepositoryOwnerFromEnv,
} from "../utils/envHelpers"

interface InitProps extends PropsWithChildren {
  settings?: LekkoSettings
  defaultConfigs: Array<ResolvedLekkoConfig<EvaluationType>>
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: DEFAULT_LEKKO_REFRESH,
  },
})

function init({
  settings = DEFAULT_LEKKO_SETTINGS,
  defaultConfigs,
}: InitProps): Client {
  const repositoryOwner =
    settings?.repositoryOwner ?? getRepositoryOwnerFromEnv()
  const repositoryName = settings?.repositoryName ?? getRepositoryNameFromEnv()

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
  const clientRef = useRef<Client | null>(null)

  if (clientRef.current === null) {
    clientRef.current = init({ settings, defaultConfigs })
  }

  // should never happen after sync init function
  if (clientRef.current === null) {
    return <>{children}</>
  }

  return (
    <LekkoRemoteClientContext.Provider value={clientRef.current}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </LekkoRemoteClientContext.Provider>
  )
}
