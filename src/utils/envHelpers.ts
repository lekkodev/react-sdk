// The following methods try to load environment variables for well-known frameworks.
// Unfortunately, most build tools seem to take the approach of replacing full
// direct access during build (e.g. process.env.SOME_ENV_VAR) so it's not
// recommended to use dynamic syntax. (e.g. process.env["SOME_ENV_VAR"])

export function getAPIKeyFromEnv(): string | undefined {
  try {
    // @ts-expect-error Vite uses import.meta.env
    return import.meta.env.VITE_LEKKO_API_KEY
  } catch (e) {}
  try {
    return process.env.NEXT_PUBLIC_LEKKO_API_KEY
  } catch (e) {}
  try {
    return process.env.REACT_APP_LEKKO_API_KEY
  } catch (e) {}
  try {
    return process.env.LEKKO_API_KEY
  } catch (e) {}
}

export function getRepositoryOwnerFromEnv(): string | undefined {
  try {
    // @ts-expect-error Vite uses import.meta.env
    return import.meta.env.VITE_LEKKO_REPOSITORY_OWNER
  } catch (e) {}
  try {
    return process.env.NEXT_PUBLIC_LEKKO_REPOSITORY_OWNER
  } catch (e) {}
  try {
    return process.env.REACT_APP_LEKKO_REPOSITORY_OWNER
  } catch (e) {}
  try {
    return process.env.LEKKO_REPOSITORY_OWNER
  } catch (e) {}
}

export function getRepositoryNameFromEnv(): string | undefined {
  try {
    // @ts-expect-error Vite uses import.meta.env
    return import.meta.env.VITE_LEKKO_REPOSITORY_NAME
  } catch (e) {}
  try {
    return process.env.NEXT_PUBLIC_LEKKO_REPOSITORY_NAME
  } catch (e) {}
  try {
    return process.env.REACT_APP_LEKKO_REPOSITORY_NAME
  } catch (e) {}
  try {
    return process.env.LEKKO_REPOSITORY_NAME
  } catch (e) {}
}

export function getHostnameFromEnv(): string | undefined {
  try {
    // @ts-expect-error Vite uses import.meta.env
    return import.meta.env.VITE_LEKKO_HOSTNAME
  } catch (e) {}
  try {
    return process.env.NEXT_PUBLIC_LEKKO_HOSTNAME
  } catch (e) {}
  try {
    return process.env.REACT_APP_LEKKO_HOSTNAME
  } catch (e) {}
  try {
    return process.env.LEKKO_HOSTNAME
  } catch (e) {}
}
