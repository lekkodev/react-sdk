import { useLekkoConfigFetch } from "./hooks/useLekkoConfigFetch"
import {
  LekkoConfigProvider,
  LekkoIntermediateConfigProvider,
} from "./providers/lekkoConfigProvider"
import {
  LekkoConfigRemoteProvider,
  LekkoIntermediateConfigRemoteProvider,
} from "./providers/lekkoConfigRemoteProvider"

import { createMockClient } from "./mockHelpers/createMockClient"
import { LekkoConfigMockProvider } from "./providers/lekkoConfigMockProvider"
import {
  ClientContext,
  type Client,
  RepositoryKey,
  type SyncClient,
} from "@lekko/js-sdk"
import { type DehydratedState } from "@tanstack/react-query"
import { getCombinedContext, getContextJSON } from "./utils/context"
import { LekkoGlobalContext } from "./providers/lekkoGlobalContext"

export type { LekkoConfig } from "./utils/types"
export * from "./hooks/useLekkoConfigSuspend"
export * from "./hooks/useLekkoConfigDLE"
export * from "./hooks/useLekkoConfig"
export * from "./utils/types"
export * from "./errors/types"

export {
  useLekkoConfigFetch,
  LekkoConfigProvider,
  createMockClient,
  LekkoConfigMockProvider,
  RepositoryKey,
  ClientContext,
  type Client,
  LekkoIntermediateConfigProvider,
  type DehydratedState,
  getContextJSON,
  getCombinedContext,
  LekkoGlobalContext,
  LekkoConfigRemoteProvider,
  LekkoIntermediateConfigRemoteProvider,
  type SyncClient,
}
