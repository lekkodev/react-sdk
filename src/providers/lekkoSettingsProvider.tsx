import { createContext } from "react"
import { DEFAULT_LEKKO_SETTINGS } from "../utils/constants"
import { type LekkoSettings } from "../utils/types"

export const LekkoSettingsContext = createContext<LekkoSettings>(
  DEFAULT_LEKKO_SETTINGS,
)
