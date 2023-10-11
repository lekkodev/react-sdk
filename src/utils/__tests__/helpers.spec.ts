import { ClientContext } from "js-sdk"
import { createStableKey } from "../helpers"
import { EvaluationType } from "../types"
import { RepositoryKey } from "@buf/lekkodev_sdk.bufbuild_es/lekko/client/v1beta1/configuration_service_pb"

const config = {
  namespaceName: "namespace-1",
  configName: "config-1",
  context: new ClientContext()
    .setString("string", "hello")
    .setBoolean("bool", true)
    .setInt("int", 2),
  evaluationType: EvaluationType.INT,
}

const repository = RepositoryKey.fromJson({
  ownnerName: "owner-1",
  repoName: "repo-1",
})

describe("helpers", () => {
  it("should create a stable key for a lekko config", () => {
    expect(createStableKey(config, repository)).toEqual([
      'owner-1_repo-1_namespace-1_config-1_bool:{"boolValue":true}_int:{"intValue":"2"}_string:{"stringValue":"hello"}_Int',
    ])
  })
})
