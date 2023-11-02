import { createContext } from "react"
import { LekkoConfigProvider, type ProviderProps } from "./lekkoConfigProvider"

interface NoOpProps {
  allowNoOp: boolean
}

export const NoOpProvider = createContext<NoOpProps>({
  allowNoOp: false,
})

export default function LekkoNoOpConfigProvider(props: ProviderProps) {
  return (
    <NoOpProvider.Provider value={{ allowNoOp: true }}>
      <LekkoConfigProvider {...props} />
    </NoOpProvider.Provider>
  )
}
