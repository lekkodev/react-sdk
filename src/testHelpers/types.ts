import { type LekkoConfig } from "../utils/types"
import { type Any } from "@bufbuild/protobuf"

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
