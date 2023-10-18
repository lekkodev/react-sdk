interface ImportMetaEnv {
  readonly VITE_API_KEY: string
  readonly VITE_REPOSITORY_OWNER: string
  readonly VITE_REPOSITORY_NAME: string
  readonly VITE_HOSTNAME?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

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

  try {
    if (envValue === undefined) {
      envValue = (import.meta as unknown as ImportMeta).env[`VITE_${key}`]
    }
  } catch (error) {
    console.log(
      "Neither process.env nor meta.env are defined, env variables are not available for the Lekko SDK",
    )
  }

  return envValue
}
