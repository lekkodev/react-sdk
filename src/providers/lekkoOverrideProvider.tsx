import { createContext } from "react"
import { type SimpleResult } from "../utils/types"

export interface OverrideContext {
  setOverrides: (overrides: Record<string, SimpleResult>) => void
  overrides: Record<string, SimpleResult>
}

export const LekkoOverrideContext = createContext<OverrideContext>({
  setOverrides: (overrides: Record<string, SimpleResult>) => {},
  overrides: {},
})
