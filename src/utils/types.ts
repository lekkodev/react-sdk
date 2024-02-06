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
    ? bigint
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
  backgroundRefetch?: boolean
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
export const RESET_CHANGES = "RESET_CHANGES"
export const RESET_CHANGES_RESPONSE = "RESET_CHANGES_RESPONSE"
export const REQUEST_IS_USING_PERSISTED_STATE =
  "REQUEST_IS_USING_PERSISTED_STATE"
export const REQUEST_IS_USING_PERSISTED_STATE_RESPONSE =
  "REQUEST_IS_USING_PERSISTED_STATE_RESPONSE"

interface BaseMessageData {
  type: string
}

export interface RequestConfigsMessageData extends BaseMessageData {
  type: "REQUEST_CONFIGS"
}

export interface ResetChangesMessageData extends BaseMessageData {
  type: "RESET_CHANGES"
}

export interface RequestIsUsingPersistedStateMessageData
  extends BaseMessageData {
  type: "REQUEST_IS_USING_PERSISTED_STATE"
}

interface Result {
  // this type can be number | string | boolean | json (any)
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  value: any
  evaluationType: EvaluationType
}
export type ConfigResults = Record<string, Result>

export interface SaveConfigsMessageData extends BaseMessageData {
  type: "SAVE_CONFIGS"
  configs: ConfigResults
  persistChanges: boolean
}

export interface SaveContextMessageData extends BaseMessageData {
  type: "SAVE_CONTEXT"
  context: ClientContext
  persistChanges: boolean
}

type ExtensionMessageData =
  | RequestConfigsMessageData
  | SaveConfigsMessageData
  | SaveContextMessageData
  | ResetChangesMessageData
  | RequestIsUsingPersistedStateMessageData

export interface ExtensionMessage {
  data?: ExtensionMessageData
}

export interface ConfigOptions {
  backgroundRefetch?: boolean
}
