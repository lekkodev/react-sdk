import { createContext } from "react"
import { type ResultSet } from "../utils/types"

export interface OverrideContext {
  setOverrides: (overrides: Record<string, ResultSet>) => void
  overrides: Record<string, ResultSet>
}

export const LekkoOverrideContext = createContext<OverrideContext>({
  setOverrides: (overrides: Record<string, ResultSet>) => {},
  overrides: {},
})
