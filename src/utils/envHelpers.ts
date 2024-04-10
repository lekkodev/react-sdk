// The following methods try to load environment variables for well-known frameworks.
// Unfortunately, most build tools seem to take the approach of replacing full
// direct access during build (e.g. process.env.SOME_ENV_VAR) so it's not
// recommended to use dynamic syntax. (e.g. process.env["SOME_ENV_VAR"])

export function getAPIKeyFromEnv(): string | undefined {
  let apiKey: string | undefined
  try {
    // @ts-expect-error Vite uses import.meta.env
    apiKey = import.meta.env.VITE_LEKKO_API_KEY
  } catch (e) {}
  try {
    if (apiKey === undefined) apiKey = process.env.NEXT_PUBLIC_LEKKO_API_KEY
  } catch (e) {}
  try {
    if (apiKey === undefined) apiKey = process.env.REACT_APP_LEKKO_API_KEY
  } catch (e) {}
  try {
    if (apiKey === undefined) apiKey = process.env.LEKKO_API_KEY
  } catch (e) {}
  return apiKey
}

export function getRepositoryOwnerFromEnv(): string | undefined {
  let repositoryOwner: string | undefined
  try {
    // @ts-expect-error Vite uses import.meta.env
    repositoryOwner = import.meta.env.VITE_LEKKO_REPOSITORY_OWNER
  } catch (e) {}
  try {
    if (repositoryOwner === undefined)
      repositoryOwner = process.env.NEXT_PUBLIC_LEKKO_REPOSITORY_OWNER
  } catch (e) {}
  try {
    if (repositoryOwner === undefined)
      repositoryOwner = process.env.REACT_APP_LEKKO_REPOSITORY_OWNER
  } catch (e) {}
  try {
    if (repositoryOwner === undefined)
      repositoryOwner = process.env.LEKKO_REPOSITORY_OWNER
  } catch (e) {}
  return repositoryOwner
}

export function getRepositoryNameFromEnv(): string | undefined {
  let repositoryName: string | undefined
  try {
    // @ts-expect-error Vite uses import.meta.env
    repositoryName = import.meta.env.VITE_LEKKO_REPOSITORY_NAME
  } catch (e) {}
  try {
    if (repositoryName === undefined)
      repositoryName = process.env.NEXT_PUBLIC_LEKKO_REPOSITORY_NAME
  } catch (e) {}
  try {
    if (repositoryName === undefined)
      repositoryName = process.env.REACT_APP_LEKKO_REPOSITORY_NAME
  } catch (e) {}
  try {
    if (repositoryName === undefined)
      repositoryName = process.env.LEKKO_REPOSITORY_NAME
  } catch (e) {}
  return repositoryName
}

export function getHostnameFromEnv(): string | undefined {
  let hostname: string | undefined
  try {
    // @ts-expect-error Vite uses import.meta.env
    hostname = import.meta.env.VITE_LEKKO_HOSTNAME
  } catch (e) {}
  try {
    if (hostname === undefined)
      hostname = process.env.NEXT_PUBLIC_LEKKO_HOSTNAME
  } catch (e) {}
  try {
    if (hostname === undefined) hostname = process.env.REACT_APP_LEKKO_HOSTNAME
  } catch (e) {}
  try {
    if (hostname === undefined) hostname = process.env.LEKKO_HOSTNAME
  } catch (e) {}
  return hostname
}
