import { type EvaluationType, type LekkoConfig } from "../utils/types"
import { type Any } from "@bufbuild/protobuf"

export interface ResolvedBoolLekkoConfig
  extends LekkoConfig<EvaluationType.BOOL> {
  result: boolean
}

export interface ResolvedStringLekkoConfig
  extends LekkoConfig<EvaluationType.STRING> {
  result: string
}

export interface ResolvedFloatLekkoConfig
  extends LekkoConfig<EvaluationType.FLOAT> {
  result: number
}

export interface ResolvedIntLekkoConfig
  extends LekkoConfig<EvaluationType.INT> {
  result: bigint
}

export interface ResolvedJSONLekkoConfig
  extends LekkoConfig<EvaluationType.JSON> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any
}

export interface ResolvedProtoLekkoConfig
  extends LekkoConfig<EvaluationType.PROTO> {
  result: Any
}

export type ResolvedLekkoConfig =
  | ResolvedBoolLekkoConfig
  | ResolvedStringLekkoConfig
  | ResolvedIntLekkoConfig
  | ResolvedFloatLekkoConfig
  | ResolvedJSONLekkoConfig
  | ResolvedProtoLekkoConfig
