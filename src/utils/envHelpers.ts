type EnvVariable =
  | "LEKKO_API_KEY"
  | "LEKKO_REPOSITORY_OWNER"
  | "LEKKO_REPOSITORY_NAME"
  | "LEKKO_HOSTNAME"

export function getEnvironmentVariable(key: EnvVariable) {
  try {
    // @ts-expect-error Checking for Vite via import.meta.env
    return import.meta.env[`VITE_${key}`]
  } catch (error) {}

  try {
    return process.env[`REACT_APP_${key}`]
  } catch (error) {}
}
