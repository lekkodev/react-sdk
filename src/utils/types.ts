import { type SyncClient, type Client, type ClientContext } from "@lekko/js-sdk"
import { type Any } from "@bufbuild/protobuf"

export type Optional<T> = T | undefined

export enum EvaluationType {
  STRING = "String",
  INT = "Int",
  FLOAT = "Float",
  BOOL = "Bool",
  JSON = "JSON",
  PROTO = "Proto",
}

export type JSONValue =
  | number
  | string
  | boolean
  | null
  | JSONObject
  | JSONValue[]
// Can't use Record here due to circular reference
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions, @typescript-eslint/consistent-indexed-object-style
export type JSONObject = {
  [key: string]: JSONValue
}

export interface JSONClientContext {
  data: JSONObject
}

export type LekkoContext = Record<string, boolean | string | number>

export interface LekkoConfig<E extends EvaluationType = EvaluationType> {
  namespaceName: string
  configName: string
  context?: ClientContext
  evaluationType: E
}

// Functional config interface that supports native lang experience for local and remote configs
export type LekkoConfigFn<T, C extends LekkoContext> =
  | ((context: C) => T)
  | {
      (context: C, client?: SyncClient): T
      // Augmented properties - should be present when using remote
      _namespaceName: string
      _configName: string
      _evaluationType: EvaluationType
    }

// Functional config interface that supports native lang experience for local and remote configs
export type LekkoRemoteConfigFn<T, C extends LekkoContext> =
  | ((context: C) => Promise<T>)
  | {
      (context: C, client?: Client): Promise<T>
      // Augmented properties - should be present when using remote
      _namespaceName: string
      _configName: string
      _evaluationType: EvaluationType
    }

export type UntypedLekkoConfig = Omit<LekkoConfig, "evaluationType">

export type EvaluationResult<E extends EvaluationType = EvaluationType> =
  E extends EvaluationType.BOOL
    ? boolean
    : E extends EvaluationType.FLOAT
      ? number
      : E extends EvaluationType.INT
        ? bigint
        : E extends EvaluationType.STRING
          ? string
          : E extends EvaluationType.JSON
            ? JSONObject
            : E extends EvaluationType.PROTO
              ? Any
              : never

export interface LekkoSettings {
  apiKey?: string
  repositoryName?: string
  repositoryOwner?: string
  /**
   * For local development. A URL of a running Lekko config server.
   */
  hostname?: string
  nonBlockingProvider?: boolean
  backgroundRefetch?: boolean
  /**
   * For local development in conjunction with a locally running Lekko config
   * server. Pass the path to a config repository on the local filesystem.
   * If omitted, a default location will be used.
   */
  localPath?: string
}

export interface ResolvedLekkoConfig<
  E extends EvaluationType = EvaluationType,
> {
  config: LekkoConfig<E>
  result: EvaluationResult<E>
}

export interface EditableResolvedLekkoConfig<
  E extends EvaluationType = EvaluationType,
> extends ResolvedLekkoConfig<E> {
  key: string[]
}

export type DefaultConfigLookup = Record<string, ResolvedLekkoConfig>

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

export type Result =
  | {
      value: string
      evaluationType: EvaluationType.STRING
    }
  | {
      value: number
      evaluationType: EvaluationType.INT | EvaluationType.FLOAT
    }
  | {
      value: boolean
      evaluationType: EvaluationType.BOOL
    }
  | {
      value: JSONObject
      evaluationType: EvaluationType.JSON
    }
export type ConfigResults = Record<string, Result>

export interface SaveConfigsMessageData extends BaseMessageData {
  type: "SAVE_CONFIGS"
  configs: ConfigResults
  persistChanges: boolean
}

export interface SaveContextMessageData extends BaseMessageData {
  type: "SAVE_CONTEXT"
  context: JSONClientContext
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
