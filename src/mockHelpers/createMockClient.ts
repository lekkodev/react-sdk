import { type ResolvedLekkoConfig } from "../utils/types"

import { getMockedRemoteValue, getMockedValue } from "./helpers"
import { EvaluationType } from "../utils/types"
import { type Any } from "@bufbuild/protobuf"
import {
  type SyncClient,
  type Client,
  type ClientContext,
  type RepositoryKey,
} from "@lekko/js-sdk"
import { mapStableKeysToConfigs } from "../utils/helpers"

interface Props {
  repositoryKey: RepositoryKey
  defaultConfigs: Array<ResolvedLekkoConfig<EvaluationType>>
  repositorySha?: string
}

export function createMockRemoteClient({
  repositoryKey,
  defaultConfigs,
  repositorySha = "sha123",
}: Props): Client {
  const lookupMap = mapStableKeysToConfigs(defaultConfigs, repositoryKey)

  const mockClient = {
    getBool: async (
      namespaceName: string,
      configName: string,
      context: ClientContext | undefined,
    ) =>
      await getMockedRemoteValue<boolean>(
        EvaluationType.BOOL,
        namespaceName,
        configName,
        context,
        repositoryKey,
        lookupMap,
      ),
    getString: async (
      namespaceName: string,
      configName: string,
      context: ClientContext | undefined,
    ) =>
      await getMockedRemoteValue<string>(
        EvaluationType.STRING,
        namespaceName,
        configName,
        context,
        repositoryKey,
        lookupMap,
      ),
    getInt: async (
      namespaceName: string,
      configName: string,
      context: ClientContext | undefined,
    ) => {
      const mockedValue = await getMockedRemoteValue<number>(
        EvaluationType.INT,
        namespaceName,
        configName,
        context,
        repositoryKey,
        lookupMap,
      )
      return BigInt(mockedValue)
    },
    getFloat: async (
      namespaceName: string,
      configName: string,
      context: ClientContext | undefined,
    ) =>
      await getMockedRemoteValue<number>(
        EvaluationType.FLOAT,
        namespaceName,
        configName,
        context,
        repositoryKey,
        lookupMap,
      ),
    getJSON: async (
      namespaceName: string,
      configName: string,
      context: ClientContext | undefined,
    ) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await getMockedRemoteValue<any>(
        EvaluationType.JSON,
        namespaceName,
        configName,
        context,
        repositoryKey,
        lookupMap,
      ),
    getProto: async (
      namespaceName: string,
      configName: string,
      context: ClientContext | undefined,
    ) =>
      await getMockedRemoteValue<Any>(
        EvaluationType.PROTO,
        namespaceName,
        configName,
        context,
        repositoryKey,
        lookupMap,
      ),
    repository: repositoryKey,
    getRepoSha: async () => repositorySha,
    close: async () => {},
  }

  return mockClient
}

export function createMockClient({
  repositoryKey,
  defaultConfigs,
  repositorySha = "sha123",
}: Props): SyncClient {
  const lookupMap = mapStableKeysToConfigs(defaultConfigs, repositoryKey)

  const mockClient = {
    getBool: (
      namespaceName: string,
      configName: string,
      context: ClientContext | undefined,
    ) =>
      getMockedValue<boolean>(
        EvaluationType.BOOL,
        namespaceName,
        configName,
        context,
        repositoryKey,
        lookupMap,
      ),
    getString: (
      namespaceName: string,
      configName: string,
      context: ClientContext | undefined,
    ) =>
      getMockedValue<string>(
        EvaluationType.STRING,
        namespaceName,
        configName,
        context,
        repositoryKey,
        lookupMap,
      ),
    getInt: (
      namespaceName: string,
      configName: string,
      context: ClientContext | undefined,
    ) => {
      const mockedValue = getMockedValue<number>(
        EvaluationType.INT,
        namespaceName,
        configName,
        context,
        repositoryKey,
        lookupMap,
      )
      return BigInt(mockedValue)
    },
    getFloat: (
      namespaceName: string,
      configName: string,
      context: ClientContext | undefined,
    ) =>
      getMockedValue<number>(
        EvaluationType.FLOAT,
        namespaceName,
        configName,
        context,
        repositoryKey,
        lookupMap,
      ),
    getJSON: (
      namespaceName: string,
      configName: string,
      context: ClientContext | undefined,
    ) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getMockedValue<any>(
        EvaluationType.JSON,
        namespaceName,
        configName,
        context,
        repositoryKey,
        lookupMap,
      ),
    getProto: (
      namespaceName: string,
      configName: string,
      context: ClientContext | undefined,
    ) =>
      getMockedValue<Any>(
        EvaluationType.PROTO,
        namespaceName,
        configName,
        context,
        repositoryKey,
        lookupMap,
      ),
    repository: repositoryKey,
    getRepoSha: async () => repositorySha,
    close: async () => {},
  }

  return mockClient
}
