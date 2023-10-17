export class NetworkError extends Error {}
export class ConfigNotFoundError extends Error {}
export class NotAuthorizedError extends Error {}

export interface ConnectError {
  code: number
  rawMessage: string
}
