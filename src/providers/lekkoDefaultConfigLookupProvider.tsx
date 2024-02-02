import { createContext } from "react"
import { type DefaultConfigLookup } from "../utils/types"

export const LekkoDefaultConfigLookupProvider = createContext<
  DefaultConfigLookup | undefined
>(undefined)

export default LekkoDefaultConfigLookupProvider
