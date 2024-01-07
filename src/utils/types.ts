import { type ClientContext } from "@lekko/js-sdk"
import { type Any } from "@bufbuild/protobuf"

export enum EvaluationType {
  STRING = "String",
  INT = "Int",
  FLOAT = "Float",
  BOOL = "Bool",
  JSON = "JSON",
  PROTO = "Proto",
}

export interface LekkoConfig<E extends EvaluationType> {
  namespaceName: string
  configName: string
  context?: ClientContext
  evaluationType: E
}

export type EvaluationResult<E extends EvaluationType> =
  E extends EvaluationType.BOOL
    ? boolean
    : E extends EvaluationType.FLOAT
    ? number
    : E extends EvaluationType.INT
    ? number
    : E extends EvaluationType.STRING
    ? string
    : E extends EvaluationType.JSON
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any
    : E extends EvaluationType.PROTO
    ? Any
    : never

export interface LekkoSettings {
  apiKey?: string
  repositoryName?: string
  repositoryOwner?: string
  hostname?: string
  nonBlockingProvider?: boolean
}

export interface ResolvedLekkoConfig<E extends EvaluationType> {
  config: LekkoConfig<E>
  result: EvaluationResult<E>
}

export interface EditableResolvedLekkoConfig<E extends EvaluationType> {
  config: LekkoConfig<E>
  result: EvaluationResult<E>
  key: string[]
}

export type DefaultConfigLookup = Record<
  string,
  ResolvedLekkoConfig<EvaluationType>
>

export const REQUEST_CONFIGS = "REQUEST_CONFIGS"
export const SAVE_CONFIGS = "SAVE_CONFIGS"
export const REQUEST_CONFIGS_RESPONSE = "REQUEST_CONFIGS_RESPONSE"
export const SAVE_CONFIGS_RESPONSE = "SAVE_CONFIGS_RESPONSE"
export const SAVE_CONTEXT = "SAVE_CONTEXT"
export const SAVE_CONTEXT_RESPONSE = "SAVE_CONTEXT_RESPONSE"

export type ExtensionMessageData = Record<string, any>

export interface ExtensionMessage {
  data?: ExtensionMessageData
}
