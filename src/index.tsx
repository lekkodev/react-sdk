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
import { type DehydratedState } from "@tanstack/react-query"

export type { LekkoConfig } from "./utils/types"
export * from "./utils/types"
export * from "./errors/types"

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
  type DehydratedState,
}
