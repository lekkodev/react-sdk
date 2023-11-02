import { type ResolvedLekkoConfig } from "../utils/types"

import { getMockedValue } from "./helpers"
import { EvaluationType } from "../utils/types"
import { type Any } from "@bufbuild/protobuf"
import {
  type Client,
  type ClientContext,
  type RepositoryKey,
} from "@lekko/js-sdk"
import { mapStableKeysToConfigs } from "../utils/helpers"

interface Props {
  repositoryKey: RepositoryKey
  resolvedConfigs: ResolvedLekkoConfig<EvaluationType>[]
  resolvedDefaultConfigs?: ResolvedLekkoConfig<EvaluationType>[]
  repositorySha?: string
}

export function createMockClient({
  repositoryKey,
  resolvedConfigs,
  resolvedDefaultConfigs = [],
  repositorySha = "sha123",
}: Props): Client {
  const lookupMap = mapStableKeysToConfigs(resolvedConfigs, repositoryKey)
  const defaultLookupMap = mapStableKeysToConfigs(
    resolvedDefaultConfigs,
    repositoryKey,
  )

  const mockClient = {
    getBool: async (
      namespaceName: string,
      configName: string,
      context: ClientContext | undefined,
    ) =>
      await getMockedValue<boolean>(
        EvaluationType.BOOL,
        namespaceName,
        configName,
        context,
        repositoryKey,
        lookupMap,
        defaultLookupMap,
      ),
    getString: async (
      namespaceName: string,
      configName: string,
      context: ClientContext | undefined,
    ) =>
      await getMockedValue<string>(
        EvaluationType.STRING,
        namespaceName,
        configName,
        context,
        repositoryKey,
        lookupMap,
        defaultLookupMap,
      ),
    getInt: async (
      namespaceName: string,
      configName: string,
      context: ClientContext | undefined,
    ) => {
      const mockedValue = await getMockedValue<number>(
        EvaluationType.INT,
        namespaceName,
        configName,
        context,
        repositoryKey,
        lookupMap,
        defaultLookupMap,
      )
      return BigInt(mockedValue)
    },
    getFloat: async (
      namespaceName: string,
      configName: string,
      context: ClientContext | undefined,
    ) =>
      await getMockedValue<number>(
        EvaluationType.FLOAT,
        namespaceName,
        configName,
        context,
        repositoryKey,
        lookupMap,
        defaultLookupMap,
      ),
    getJSON: async (
      namespaceName: string,
      configName: string,
      context: ClientContext | undefined,
    ) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await getMockedValue<any>(
        EvaluationType.JSON,
        namespaceName,
        configName,
        context,
        repositoryKey,
        lookupMap,
        defaultLookupMap,
      ),
    getProto: async (
      namespaceName: string,
      configName: string,
      context: ClientContext | undefined,
    ) =>
      await getMockedValue<Any>(
        EvaluationType.PROTO,
        namespaceName,
        configName,
        context,
        repositoryKey,
        lookupMap,
        defaultLookupMap,
      ),
    repository: repositoryKey,
    getRepoSha: async () => repositorySha,
    close: async () => {},
  }

  return mockClient
}
