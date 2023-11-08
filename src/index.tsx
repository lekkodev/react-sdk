import { useLekkoConfig } from "./hooks/useLekkoConfig"
import { useLekkoConfigDLE } from "./hooks/useLekkoConfigDLE"
import { useLekkoConfigFetch } from "./hooks/useLekkoConfigFetch"
import {
  LekkoConfigProvider,
  LekkoIntermediateConfigProvider,
} from "./providers/lekkoConfigProvider"

import { createMockClient } from "./mockHelpers/createMockClient"
import { LekkoConfigMockProvider } from "./providers/lekkoConfigMockProvider"
import { ClientContext, type Client, RepositoryKey } from "@lekko/js-sdk"
import { LekkoHydrater } from "./hydration/lekkoHydrater"

export type { LekkoConfig } from "./utils/types"
export * from "./utils/types"
export * from "./errors/types"
import { DehydratedState } from "@tanstack/react-query"

export {
  useLekkoConfig,
  useLekkoConfigDLE,
  useLekkoConfigFetch,
  LekkoConfigProvider,
  createMockClient,
  LekkoConfigMockProvider,
  RepositoryKey,
  ClientContext,
  type Client,
  LekkoIntermediateConfigProvider,
  LekkoHydrater,
  type DehydratedState
}
