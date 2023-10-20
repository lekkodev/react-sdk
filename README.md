# Lekko React Client SDK

The Lekko Client SDK for React

## Getting Started

### Installation

You can install `@lekko/react-sdk` using NPM or Yarn.

`@lekko/react-sdk` depends on source code generated by Buf which is hosted on their NPM registry. Prior to adding the Lekko SDK, configure your package manager to use Buf's NPM registry for `@buf` scoped packages.

> **Note**
>
> Due to the dependency on Buf's source code generation, we currently do not support installing with Yarn versions older than v2 (a.k.a. [Yarn Classic](https://yarnpkg.com/getting-started/migration)). Please refer to Buf's docs [here](https://buf.build/docs/bsr/remote-packages/npm/#other-package-managers) for more information.

#### NPM

The following command updates your `.npmrc` file.

```
npm config set @buf:registry https://buf.build/gen/npm/v1
```

#### Yarn

You must edit your [`.yarnrc.yml`](https://yarnpkg.com/configuration/yarnrc) file to include the following scope:

```yaml
npmScopes:
  buf:
    npmRegistryServer: https://buf.build/gen/npm/v1
```

Then, you can add the package to your project by running `npm install @lekko/react-sdk` or `yarn add @lekko/react-sdk`.

### Client API Keys

You will need to generate an API key and optionally can restrict config evaluations to specific namespaces that are needed by the client.

## Usage

### Setting up the API key and repository

- Create a .env file to provide your credentials and API information to the SDK

#### React-Create-App or Webpack:

- Reference if you are using react-create-app: https://create-react-app.dev/docs/adding-custom-environment-variables/
- Reference if you are using webpack: https://www.npmjs.com/package/dotenv-webpack

```
REACT_APP_API_KEY=<your API key>
REACT_APP_REPOSITORY_OWNER=<owner name>
REACT_APP_REPOSITORY_NAME=<repo name>
```

#### Vite:

- First, define the Vite environment variables in a .env file
- Environment variable reference if you are using vite: https://vitejs.dev/guide/env-and-mode.html

```
VITE_API_KEY=<your API key>
VITE_REPOSITORY_OWNER=<owner name>
VITE_REPOSITORY_NAME=<repo name>
```

- Due to Vite's env variables not supporting commonJS, you must pass in the Lekko settings to the provider.

```
const lekkoSettings: LekkoSettings = {
    apiKey: import.meta.env['VITE_API_KEY'],
    repositoryOwner: import.meta.env['VITE_REPOSITORY_OWNER'],
    repositoryName: import.meta.env['VITE_REPOSITORY_NAME'],
    hostname: import.meta.env['VITE_HOSTNAME']
}

<LekkoConfigProvider settings={lekkoSettings}>
  ...
</LekkoConfigProvider>
```

> **Note**
>
> The current React SDK usage is limited to a single repository.

- Create a set of evaluations that should be available upon initial app load.  You must specify the namespace, config name, evaluation result type, and optionally provide a context.  If a context is not provided, the evaluation will result in the default value for that config.

```
const EVALUATIONS = [{
  namespaceName: 'default',
  configName: 'example',
  evaluationType: EvaluationType.BOOL,
  context: new ClientContext().setInt("organization_id", 3).setString("state", "texas")
}]
```

#### Types

```
enum EvaluationType {
  STRING = "String",
  INT = "Int",
  FLOAT = "Float",
  BOOL = "Bool",
  JSON = "JSON",
  PROTO = "Proto",
}

interface LekkoConfig {
  namespaceName: string
  configName: string
  context?: ClientContext
  evaluationType: EvaluationType
}
```

#### Contexts

Contexts are optional typed key value pairs that the evaluator will use to determine the result of the config evaluation. The process is constructing a new instance of a ClientContext and then chaining key value pairs by the method that corresponds to the type of that value.  The options are setInt, setDouble, setString, and setBool.

```
new ClientContext().setInt("organization_id", 3).setString("state", "texas")
```

## Providers

Providers setup our React-Query client that will be used to store evaluations for use throughout your app.  The provider should be wrapped in your App suspense boundary.  In most cases, an ErrorBoundary would also be needed to capture and handle errors from the provider.

For Reference: https://tanstack.com/query/v4/docs/react/overview

```
<Suspense fallback={<div>Loading...</div>}>
    <LekkoConfigProvider configRequests={[EVALUATIONS]}>
        <RestOfApp />
    </LekkoConfigProvider>
</Suspense>
```

#### Initial evaluations

The optional configRequests prop takes a list of LekkoConfig's that will be immediately evaluated in parallel before the Provider renders its children.  This initial list of configs will be available through the evaluation hooks in the children of the Provider without triggering new suspense boundaries or flickering waiting for their result.

## Hooks

#### useLekkoConfig

This hook takes a LekkoConfig instance and will suspend until the evaluation returns.  If the config was already passed as an initial config request to the provider, the evaluation result will be available immediately.  Once a config has been evaluated, we cache the result for all future uses of useLekkoConfig with that same config request.  The order of the context attributes does not affect caching, as we generate a stable key regardless of order.  This hook should be surrounded by a Suspense boundary in one of its parents and optionally an ErrorBoundary.

```
function Evaluation() {
  const evaluation = useLekkoConfig({
    namespaceName: 'default',
    configName: 'example',
    evaluationType: EvaluationType.BOOL,
    context: new ClientContext().setInt("organization_id", 3).setString("state", "texas")
  })

  return (
      <div>{JSON.stringify(evaluation)}</div>
  )
}
```

#### Retry

LekkoConfig evaluations are automatically retried once on failure.

#### useLekkoConfigDLE

This hook will retrieve the evaluation and provide loading and error information.  In this case, the component rendering will not suspend and will need to handle the loading and error states within the component rather than relying on a suspense or error boundary.  Similarly to the useLekkoConfig hook, results that were previously fetched are available immediately without triggering loading.

```
function Evaluation() {
  const { evaluation, isEvaluationLoading, error } = useLekkoConfigDLE({
    namespaceName: 'default',
    configName: 'example',
    evaluationType: EvaluationType.BOOL,
    context: new ClientContext().setInt("organization_id", 3).setString("state", "texas")
  })

  if (isEvaluationLoading) {
    return <div>Loading...</div>
  }
  
  if (error) {
    return <div>{error}</div>
  }

  return (
      <div>{JSON.stringify(evaluation)}</div>
  )
}
```

#### useLekkoConfigFetch

This will allow you to trigger async fetches to evaluate any LekkoConfig.  It will not use the cache or store the returned info in the cache.  This hook is primarily for use to retrieve results on useEffects and user actions.

```
function Evaluation() {
  const fetch = useLekkoConfigFetch()
  const handleEvaluate = async () => {
    const evaluation = await fetch({
      namespaceName: 'default',
      configName: 'example',
      evaluationType: EvaluationType.BOOL,
      context: new ClientContext().setInt("organization_id", 3).setString("state", "texas")
    })
    // process or use results
  }

  return <button onClick={handleEvaluate}>click me to evaluate!</div>
}
```

## Testing

### Jest

This library exports helpers for jest including a LekkoConfigMockProvider that will not use fetch and a helper function to create mock evaluation results and default evaluation results.

#### MockClient

The first step is to use the helper function createMockClient to provide LekkoConfig evaluations for use within your tests without sending a fetch to the API.

- Create a set of LekkoConfigs that your tests will consume.  For each LekkoConfig, also generate a ResolvedLekkoConfig, which is the Config definition and the evaluation result that should be expected.

```
const stringConfig: LekkoConfig = {
    namespaceName: 'default',
    configName: 'example',
    evaluationType: EvaluationType.STRING,
    context: new ClientContext().setInt("organization_id", 3).setString("state", "texas"),
}

const resolvedStringConfig: ResolvedLekkoConfig = {
    ...stringConfig,
    result: 'string-value'
}
```

- If a LekkoConfig and ResolvedLekkoConfig do not provide a context, the MockClient will evaluate all configs that have the same namespace/config but do not match any provided result to this value.  This acts as a way to provide default evaluation logic.

```
const defaultStringConfig: LekkoConfig = {
    namespaceName: 'default',
    configName: 'example',
    evaluationType: EvaluationType.STRING,
}

const resolvedDefaultStringConfig: ResolvedLekkoConfig = {
    ...defaultStringConfig,
    result: 'default-value'
}
```

- Then create the MockClient, resolvedDefaultConfigs are optional.

```
const mockClient = createMockClient({
    repositoryKey, 
    resolvedConfigs: [
        resolvedStringConfig
    ], 
    resolvedDefaultConfigs: [resolvedDefaultStringConfig]
})
```

#### @testing-library/react test definitions

- Render your component that relies on one of the evaluation hooks within a LekkoConfigMockProvider, using the mockClient created previously

```
const { getByText } = render(
    <LekkoConfigMockProvider client={mockClient}>
        <Suspense fallback={<></>}>
            <TestComponent config={stringConfig} />
        </Suspense>
    </LekkoConfigMockProvider>
)
```

-  Then test the rendering to determine if the rendering matches the expectation given the config-evaluation result pairs you provided.

```
const content = await waitFor(() => getByText('string-value'))
expect(content).toBeInTheDocument()
```

## Caching and configuration

#### Staletime

Config evaluations will be cached for the lifecycle of the client App.  They will not be marked stale and refetched until the App is reloaded in the browser.  The reasoning for this is to prevent unwanted Suspense or loading triggers when the stale time would mark them as needing to be refetched.  It will also prevent flickering of the App if a value would change on the 2nd retrieval due to the config being updated between fetches.