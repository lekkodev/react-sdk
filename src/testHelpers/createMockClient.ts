import {
  type DefaultResolvedLekkoConfig,
  type ResolvedLekkoConfig,
} from "./types"

import { type RepositoryKey } from "@buf/lekkodev_sdk.bufbuild_es/lekko/client/v1beta1/configuration_service_pb"
import {
  createStableTestKey,
  mapStableKeysToConfigs,
  mapStableKeysToDefaultConfigs,
} from "./helpers"
import { EvaluationType } from "../utils/types"
import { type Any } from "@bufbuild/protobuf"
import { type Client } from "js-sdk"
import { ClientContext } from "js-sdk"

async function getMockedValue<T>(
  evaluationType: EvaluationType,
  namespaceName: string,
  configName: string,
  context: ClientContext,
  repositoryKey: RepositoryKey,
  lookupMap: Record<string, ResolvedLekkoConfig>,
  defaultLookupMap: Record<string, DefaultResolvedLekkoConfig>,
): Promise<T> {
  const key = createStableTestKey(
    {
      namespaceName,
      configName,
      context,
      evaluationType,
    },
    repositoryKey,
  )

  if (lookupMap[key] !== undefined) {
    return await Promise.resolve(lookupMap[key].result as T)
  }

  const defaultKey = createStableTestKey(
    {
      namespaceName,
      configName,
      context: new ClientContext(),
      evaluationType,
    },
    repositoryKey,
  )

  if (defaultLookupMap[defaultKey] !== undefined) {
    return await Promise.resolve(defaultLookupMap[defaultKey].result as T)
  }

  throw new Error("No evaluation provided for this config")
}

export function createMockClient(
  repositoryKey: RepositoryKey,
  resolvedConfigs: ResolvedLekkoConfig[],
  resolvedDefaultConfigs: DefaultResolvedLekkoConfig[] = [],
): Client {
  const lookupMap = mapStableKeysToConfigs(resolvedConfigs, repositoryKey)
  const defaultLookupMap = mapStableKeysToDefaultConfigs(
    resolvedDefaultConfigs,
    repositoryKey,
  )

  const mockClient = {
    getBool: jest.fn(
      async (namespaceName, configName, context) =>
        await getMockedValue<boolean>(
          EvaluationType.BOOL,
          namespaceName,
          configName,
          context,
          repositoryKey,
          lookupMap,
          defaultLookupMap,
        ),
    ),
    getString: jest.fn(
      async (namespaceName, configName, context) =>
        await getMockedValue<string>(
          EvaluationType.STRING,
          namespaceName,
          configName,
          context,
          repositoryKey,
          lookupMap,
          defaultLookupMap,
        ),
    ),
    // get int has a different form of casting than the rest of the types: BigInt(x)
    getInt: jest.fn(
      async (namespaceName, configName, context): Promise<bigint> => {
        const key = createStableTestKey(
          {
            namespaceName,
            configName,
            context,
            evaluationType: EvaluationType.INT,
          },
          repositoryKey,
        )
        if (lookupMap[key] !== undefined) {
          return await Promise.resolve(BigInt(lookupMap[key].result))
        }

        const defaultKey = createStableTestKey(
          {
            namespaceName,
            configName,
            context: new ClientContext(),
            evaluationType: EvaluationType.INT,
          },
          repositoryKey,
        )

        if (defaultLookupMap[defaultKey] !== undefined) {
          return await Promise.resolve(BigInt(defaultLookupMap[key].result))
        }

        throw new Error("No evaluation provided for this config")
      },
    ),
    getFloat: jest.fn(
      async (namespaceName, configName, context) =>
        await getMockedValue<number>(
          EvaluationType.FLOAT,
          namespaceName,
          configName,
          context,
          repositoryKey,
          lookupMap,
          defaultLookupMap,
        ),
    ),
    getJSON: jest.fn(
      async (namespaceName, configName, context) =>
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
    ),
    getProto: jest.fn(
      async (namespaceName, configName, context) =>
        await getMockedValue<Any>(
          EvaluationType.PROTO,
          namespaceName,
          configName,
          context,
          repositoryKey,
          lookupMap,
          defaultLookupMap,
        ),
    ),
    repository: repositoryKey,
    getRepoSha: jest.fn().mockResolvedValue("sha123"),
  }

  return mockClient
}
