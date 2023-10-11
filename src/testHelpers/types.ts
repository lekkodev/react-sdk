import { type ClientContext } from "js-sdk"
import { type EvaluationType } from "../utils/types"
import { type Any } from "@bufbuild/protobuf"

export interface DefaultResolvedBoolLekkoConfig {
  namespaceName: string
  configName: string
  evaluationType: EvaluationType.BOOL
  result: boolean
}

export interface ResolvedBoolLekkoConfig
  extends DefaultResolvedBoolLekkoConfig {
  context: ClientContext
}

export interface DefaultResolvedStringLekkoConfig {
  namespaceName: string
  configName: string
  evaluationType: EvaluationType.STRING
  result: string
}

export interface ResolvedStringLekkoConfig
  extends DefaultResolvedStringLekkoConfig {
  context: ClientContext
}

export interface DefaultResolvedIntLekkoConfig {
  namespaceName: string
  configName: string
  evaluationType: EvaluationType.INT
  result: number
}

export interface ResolvedIntLekkoConfig extends DefaultResolvedIntLekkoConfig {
  context: ClientContext
}

export interface DefaultResolvedFloatLekkoConfig {
  namespaceName: string
  configName: string
  evaluationType: EvaluationType.FLOAT
  result: number
}

export interface ResolvedFloatLekkoConfig
  extends DefaultResolvedFloatLekkoConfig {
  context: ClientContext
}

export interface DefaultResolvedJSONLekkoConfig {
  namespaceName: string
  configName: string
  evaluationType: EvaluationType.JSON
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any
}

export interface ResolvedJSONLekkoConfig
  extends DefaultResolvedJSONLekkoConfig {
  context: ClientContext
}

export interface DefaultResolvedProtoLekkoConfig {
  namespaceName: string
  configName: string
  evaluationType: EvaluationType.PROTO
  result: Any
}

export interface ResolvedProtoLekkoConfig
  extends DefaultResolvedProtoLekkoConfig {
  context: ClientContext
}

export type ResolvedLekkoConfig =
  | ResolvedBoolLekkoConfig
  | ResolvedStringLekkoConfig
  | ResolvedIntLekkoConfig
  | ResolvedFloatLekkoConfig
  | ResolvedJSONLekkoConfig
  | ResolvedProtoLekkoConfig

export type DefaultResolvedLekkoConfig =
  | DefaultResolvedBoolLekkoConfig
  | DefaultResolvedStringLekkoConfig
  | DefaultResolvedIntLekkoConfig
  | DefaultResolvedFloatLekkoConfig
  | DefaultResolvedJSONLekkoConfig
  | DefaultResolvedProtoLekkoConfig
