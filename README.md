# @lekko/react-sdk

Lekko's React SDK allows you to add dynamic configuration to your React/TypeScript applications.

Features:

- Local config evaluation
- Build-time static fallbacks (when used with one of our build-time plugins)
- Rich TypeScript integration

## Installation

### NPM

```bash
npm install @lekko/react-sdk
```

### Yarn

```bash
yarn add @lekko/react-sdk
```

## Quickstart

### Provider setup

To get started, add the `LekkoConfigProvider` to your app. This is a context provider, so it should be placed high up in the tree to make Lekko hooks work correctly in downstream components.

```typescript
import { LekkoConfigProvider } from "@lekko/react-sdk"

const App = () => {
  return (
    <LekkoConfigProvider>
      {/* Rest of your application */}
    </LekkoConfigProvider>
  )
}
```

The provider attempts to read Lekko environment variables for popular frameworks automatically. If you face issues related to missing environment variables, use the `settings` prop to pass the information in explicitly.

### Config functions

You define your dynamic configuration in files under `lekko/` (e.g. `src/lekko/default.ts`) as **config functions**. These are pure functions that take a **context** and return specific values based on contextual logic. We call this **evaluation**.

Lekko's build tools operate on the `lekko/` directory.

Example: `src/lekko/default.ts`

```typescript
/** Test feature flag description */
export function getMyFeatureFlag({ userId }: { userId: number }): boolean {
  if (userId === 15) {
    return true
  }
  return false
}

/** Config for controlling the text on the title component */
export function getTitle({ env }: { env: string }): string {
  if (env === "production") {
    return "Hello, Lekko!"
  }
  return "Dev time"
}
```

### Config hook

In your components under the provider, you can use the `useLekkoConfig` hook to pass config functions and contexts for local evaluation.

```typescript
import { useLekkoConfig } from "@lekko/react-sdk"
import { getMyFeatureFlag, getTitle } from "../lekko/default"

export function MyComponent() {
  const featureFlag = useLekkoConfig(getMyFeatureFlag, { userId: 15 })
  const title = useLekkoConfig(getTitle, { env: process.env.NODE_ENV })

  return (
    ...
  )
}
```

### Build tools

The above steps are sufficient for local development, but to enable your application to communicate with Lekko and use dynamic configuration in production, you need to install Lekko's build tools.

The build tools hook into the build process in order to:

- Transform config functions to code that connects to Lekko with static fallbacks
- Translate config functions to a cross-language DSL for local usage across projects
- Generate some binding code
- Emit environment variables for the SDK to pick up

This all happens under the hood without extra dev-time effort. These tools are provided as separate packages for different projects' usecases:

- Vite: [@lekko/vite-plugin](https://www.npmjs.com/package/@lekko/vite-plugin)
- Webpack: [@lekko/webpack-loader](https://www.npmjs.com/package/@lekko/webpack-loader)

## Performance

The SDK performs local evaluation of configs. This means that after an upfront fetch of your config repository's contents, every config evaluation through `useLekkoConfig` will **not** involve any network calls and be nearly instantaneous.

As a bonus, this means you don't need to worry about any loading states at any of the config usage sites.

## Safety

In the event that the SDK cannot reach Lekko's CDN nodes or services in production, it will have **build-time static fallbacks** available to use, based on the contents of the (local) config functions. This is another feature offered by Lekko's build tools so that you never need to worry about catastrophic crashes. Even if everything goes wrong, your app will have configs it can use, which will be at most as stale as the last time you built and deployed your app.

## Suspenseful initialization

By default, if using `LekkoConfigProvider` in production, the underlying client is **lazily initialized** while it waits to fetch data from Lekko's services for the up-to-date configs.

This means that after the initialization is complete, you may notice a flicker if there have been changes to the deployed configs. This will only happen on initial load.

However, if this flicker is a major concern, you can use the alternate `LekkoConfigProviderSuspend` instead.

```typescript
import { Suspense } from "react"
import { LekkoConfigProviderSuspend } from "@lekko/react-sdk"

const App = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LekkoConfigProviderSuspend>
        {/* Rest of your application */}
      </LekkoConfigProviderSuspend>
    </Suspense>
  )
}
```

This provider integrates with React's [Suspense](https://react.dev/reference/react/Suspense) to allow you to show a fallback UI or loading state during the initialization.
