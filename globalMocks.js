jest.mock("./src/utils/viteHelpers", () => ({
  getAPIKeyFromEnv: jest.fn(() => {
    "env-var"
  }),
  getRepositoryOwnerFromEnv: jest.fn(() => {
    "env-var"
  }),
  getRepositoryNameFromEnv: jest.fn(() => {
    "env-var"
  }),
}))
