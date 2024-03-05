# Global Fetch Wrapper

Its often useful to wrap each call to the server (or mock endpoint) in an async function. A couple of example reasons that you might want to do this are:

1. Implement an automatic request retry system.
2. Implement an automatic re-authentication system.

API SWR allows you to define a "global fetch wrapper" React hook which will be injected into each of the three request hooks ([useQuery](use-query.md), [useInfiniteQuery](use-infinite-query.md) & [useMutation](use-mutation.md)). This hook **MUST** conform to the following structure:

- It must return a single function.
- The function it returns must call the supplied `rootFetch` function with the supplied `params`/`config` and return the response.

Below is an example of a global fetch wrapper which will retry each request a maximum of `3` times in the event of a `500` error:

```TypeScript
import { type GlobalFetchWrapperHook, isAxiosError } from '@rocketmakers/api-swr';
import type { AxiosRequestConfig } from 'axios';

export const useGlobalFetchWrapper: GlobalFetchWrapperHook<AxiosRequestConfig> = () => {
  return React.useCallback(async ({ rootFetcher, params, config }) => {
    let retriesLeft = 3;
    let error: unknown;
    while (retriesLeft > 0) {
      try {
        const response = await rootFetcher(params, config);
        return response;
      } catch(e) {
        if(isAxiosError(e) && e.status === 500) {
          retriesLeft = retriesLeft - 1;
          error = e;
          continue;
        }
        throw e;
      }
    }
    throw error;
  }, []);
```

Once defined, applying this hook to any of your API SWR controllers is as simple as passing it to the controller factory like this:

```TypeScript
import { openApiControllerFactory } from '@rocketmakers/api-swr';
import { useGlobalFetchWrapper } from "*Fetch wrapper location.*"

export const apiFactory = openApiControllerFactory({
  basePath: 'https://my.example.api/dev',
  useGlobalFetchWrapper
});
```

_NOTE: An endpoint specific `fetchWrapper` can also be passed to the config on any of the three request hooks within API SWR. ([useQuery](use-query.md), [useInfiniteQuery](use-infinite-query.md) & [useMutation](use-mutation.md).) If this is passed it will **override any supplied global fetch wrapper**. If you need to use the global wrapper alongside your endpoint specific one, you will need to add it to your local fetch wrapper definition. This is to allow for maximum flexibility regarding if/when the global wrapper function is called when an endpoint specific version is supplied._

## Configuration

The function returned by all fetch wrapper hooks will receive a single object as its first argument. This object contains the following fields for use within your fetch wrapper function.

| Property      | Description                                                                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `endpointId`  | The `controller.endpoint` format endpoint ID of the request                                                                                                              |
| `rootFetcher` | A reference to the root fetch function used by SWR to request the data. **THIS MUST BE CALLED AND ITS RESPONSE RETURNED**                                                |
| `params`      | The params for the API call (usually a combination of route params, query string params, and body) **A VERSION OF THIS MUST BE PASSED TO THE ROOT FETCHER**              |
| `mode`        | The hook mode (either `query` or `mutation`)                                                                                                                             |
| `config`      | The config for the API call (specific to the fetcher, but usually non-param fetch properties like headers etc.) **A VERSION OF THIS MUST BE PASSED TO THE ROOT FETCHER** |
