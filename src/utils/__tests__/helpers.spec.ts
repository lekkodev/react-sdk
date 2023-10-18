import { ClientContext, RepositoryKey } from "@lekko/js-sdk"
import { createStableKey } from "../helpers"
import { EvaluationType } from "../types"

const simpleConfig = {
  namespaceName: "namespace-1",
  configName: "config-1",
  evaluationType: EvaluationType.INT,
}

const config = {
  ...simpleConfig,
  context: new ClientContext()
    .setString("string", "hello")
    .setBoolean("bool", true)
    .setInt("int", 2),
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
