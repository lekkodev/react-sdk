# Lekko Client React SDK

### Usage
Currently the SDK is not released.  You must clone the Client JS SDK and the Client React SDK into the same directory and yarn install.
Then in the project you want to use the sdk, in your dependencies in package.json add "react-sdk": "file:../react-sdk"

- Create a .env file to provide your credentials and api information to the sdk
The hostname is optional and only needed for local testing until we fix CORS settings on our api.
```
REACT_APP_API_KEY=<your api key>
REACT_APP_REPOSITORY_OWNER=<owner name>
REACT_APP_REPOSITORY_NAME=<repo name>
REACT_APP_HOSTNAME=http://localhost:5173/api/
```

- Create a set of evaluations that should be available upon initial app load
```
const EVALUATIONS = [{
  namespaceName: 'default',
  configName: 'example',
  evaluationType: EvaluationType.BOOL,
  context: new ClientContext().setInt("organization_id", 3).setString("state", "texas")
}]
```

- Wrap your React App in the LekkoConfigProvider
The configRequests are an optional argument
Your main app loading suspense boundary should wrap the provider
```
<Suspense fallback={<div>Loading...</div>}>
    <LekkoConfigProvider configRequests={[sampleEvaluation]}>
        <RestOfApp />
    </LekkoConfigProvider>
</Suspense>
```

# Ways of using Configs

1.  Suspense hook
This will retrieve the config if already loaded or fetch it and trigger a suspense until it is fetched.
If you did not use the provider, it will also initialize the client.
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

2.  DLE (data, loading, error) hook
This will retrieve the config if already loaded or return { evaluation, isEvaluationLoading, error }.
It will not trigger a suspense boundary unless you did not use the provider.
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

3.  Fetch hook
This will allow you to trigger async fetches of any config/context pair.  It will not use the cache or store the returned info in the cache.

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

Note: tests currently remove the node_modules that are copied from the js distribution.  This will not be necessary once these sdks have been released via yarn.

The transport API was chosen over the CachedAPI from the node project because for security, we won't want to expose the entire repository contents to the client.  Evaluations go through the API and are not done locally.
