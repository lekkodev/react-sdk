type EnvVariable =
  | "API_KEY"
  | "REPOSITORY_OWNER"
  | "REPOSITORY_NAME"
  | "HOSTNAME"

export function getEnvironmentVariable(key: EnvVariable) {
  let envValue

  try {
    envValue = process.env[`REACT_APP_${key}`]
  } catch (error) {}

  return envValue
}
