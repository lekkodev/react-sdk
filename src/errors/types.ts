export class NetworkError extends Error {}
export class ConfigNotFoundError extends Error {}
export class NotAuthorizedError extends Error {}
// for use when using hte no op provider
export class NoDefaultProvidedError extends Error {}

export interface ConnectError {
  code: number
  rawMessage: string
}
