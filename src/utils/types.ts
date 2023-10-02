import { type ClientContext } from "sdk-ts"

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
  context: ClientContext
  evaluationType: EvaluationType
}
