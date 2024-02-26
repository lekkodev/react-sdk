type EnvVariable =
  | "LEKKO_API_KEY"
  | "LEKKO_REPOSITORY_OWNER"
  | "LEKKO_REPOSITORY_NAME"
  | "LEKKO_HOSTNAME"

export function getEnvironmentVariable(key: EnvVariable) {
  let envValue

  try {
    envValue = process.env[`REACT_APP_${key}`]
  } catch (error) {}

  return envValue
}
