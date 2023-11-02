import { ClientContext, RepositoryKey } from "@lekko/js-sdk"
import { DuplicateDefaultProviderError } from "../../errors/types"
import { createStableKey, mapStableKeysToConfigs } from "../helpers"
import { EvaluationType } from "../types"

const simpleConfig = {
  namespaceName: "namespace-1",
  configName: "config-1",
  evaluationType: EvaluationType.INT,
}

const context = new ClientContext()
  .setString("string", "hello")
  .setBoolean("bool", true)
  .setInt("int", 2)

const config = {
  ...simpleConfig,
  context,
}

const repository = RepositoryKey.fromJson({
  ownerName: "owner-1",
  repoName: "repo-1",
})

describe("helpers", () => {
  it("should create a stable key for a lekko config", () => {
    expect(createStableKey(config, repository)).toEqual([
      'owner-1_repo-1_namespace-1_config-1_bool:{"boolValue":true}_int:{"intValue":"2"}_string:{"stringValue":"hello"}_Int',
    ])
  })

  it("should create a stable key for a lekko config without a context", () => {
    expect(createStableKey(simpleConfig, repository)).toEqual([
      "owner-1_repo-1_namespace-1_config-1__Int",
    ])
  })
})

const resolved1 = {
  config: {
    namespaceName: "backend",
    configName: "skip",
    evaluationType: EvaluationType.BOOL,
  },
  result: false,
}

const resolved2 = {
  config: {
    namespaceName: "backend",
    configName: "mode",
    evaluationType: EvaluationType.STRING,
    context,
  },
  result: "development",
}

const resolved3 = {
  config: {
    namespaceName: "backend",
    configName: "number",
    evaluationType: EvaluationType.INT,
    context: new ClientContext(),
  },
  result: BigInt(44),
}

describe("mapStableKeysToConfigs", () => {
  it("should create a key value map for configs", () => {
    expect(
      Object.keys(
        mapStableKeysToConfigs([resolved1, resolved2, resolved3], repository),
      ),
    ).toEqual([
      "owner-1_repo-1_backend_skip__Bool",
      'owner-1_repo-1_backend_mode_bool:{"boolValue":true}_int:{"intValue":"2"}_string:{"stringValue":"hello"}_String',
      "owner-1_repo-1_backend_number__Int",
    ])
  })

  it("should throw an error if there are duplicate resolved configs", () => {
    expect(() =>
      mapStableKeysToConfigs(
        [resolved1, resolved2, resolved3, resolved2],
        repository,
      ),
    ).toThrow(DuplicateDefaultProviderError)
  })
})
