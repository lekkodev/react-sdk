import { LekkoConfigMockProvider } from "../lekkoConfigMockProvider"
import { render } from "@testing-library/react"
import React from "react"
import { EvaluationType, type LekkoConfig } from "../../utils/types"
import { useLekkoConfig } from "../../hooks/useLekkoConfig"

jest.mock("../../utils/envHelpers", () => ({
  getAPIKeyFromEnv: () => "api_key",
  getRepositoryOwnerFromEnv: () => "test_owner",
  getRepositoryNameFromEnv: () => "test_repo",
  getHostnameFromEnv: () => "test_host",
}))

const templateConfig: LekkoConfig<EvaluationType.JSON> = {
  namespaceName: "frontend",
  configName: "templates",
  evaluationType: EvaluationType.JSON,
}

const resolvedTemplatesConfig = {
  config: templateConfig,
  result: { templates: [] },
}

function Component() {
  const value = useLekkoConfig(templateConfig)

  return <div>{JSON.stringify(value)}</div>
}

describe("LekkoConfigMockProvider", () => {
  afterEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  test("Mocking the provider allows retrieving values", async () => {
    const { getByText } = render(
      <LekkoConfigMockProvider
        settings={{
          repositoryName: "repo1",
          repositoryOwner: "owner1",
        }}
        defaultConfigs={[resolvedTemplatesConfig]}
      >
        <Component />
      </LekkoConfigMockProvider>,
    )
    expect(getByText('{"templates":[]}')).toBeInTheDocument()
  })
})
