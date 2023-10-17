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

export interface LekkoConfig {
  namespaceName: string
  configName: string
  context?: ClientContext
  evaluationType: EvaluationType
}

export interface ResolvedBoolLekkoConfig extends LekkoConfig {
  result: boolean
}

export interface ResolvedStringLekkoConfig extends LekkoConfig {
  result: string
}

export interface ResolvedFloatLekkoConfig extends LekkoConfig {
  result: number
}

export interface ResolvedIntLekkoConfig extends LekkoConfig {
  result: bigint
}

export interface ResolvedJSONLekkoConfig extends LekkoConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any
}

export interface ResolvedProtoLekkoConfig extends LekkoConfig {
  result: Any
}

export type ResolvedLekkoConfig =
  | ResolvedBoolLekkoConfig
  | ResolvedStringLekkoConfig
  | ResolvedIntLekkoConfig
  | ResolvedFloatLekkoConfig
  | ResolvedJSONLekkoConfig
  | ResolvedProtoLekkoConfig
