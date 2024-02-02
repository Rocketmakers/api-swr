# useInfiniteQuery

A hook for performing GET requests where the "infinite loader" paging model is required. It's an augmented version of the `useSWRInfinite` hook returned from the SWR library, see [here](https://swr.vercel.app/docs/pagination#useSWRInfiniteinfinite) for `useSWRInfinite` docs.

_NOTE: See [here](paging.md) for more detail on paging_

How does `useInfiniteQuery` differ from `useSWRInfinite`?

- Applies a more advanced caching logic with controller/endpoint separation and a "cache by param" shortcut. See [here](caching.md) for more info.
- Applies paging to the params object from the API client with absolute type safety.
- Interfaces with API SWR specific processes like the global [useApiProcessing](api-processing.md) hook and [fetch wrappers](global-fetch-wrapper.md).
- Interfaces with the API SWR [request mocking](mocking.md) library.

## Example

Like all API SWR endpoint hooks, the `useInfiniteQuery` hook _can_ be consumed directly by a React component. However, we recommend wrapping each endpoint hook so that the [caching](caching.md) and business logic for the endpoint can be centralized in a readable way:

```TypeScript
export const useGetUsersInfinite = (pageSize: number) => {
  return userApi.getUserList.useInfiniteQuery({
    cacheKey: 'pageSize',
    params: (pageIndex) => ({ pageSize, page: pageIndex + 1 }),
  });
};
```

In the above example, the `cacheKey` has been configured to read the `pageSize` parameter, and the `params` are being set dynamically from the current page index. It's important that this logic is _always_ in place when this endpoint is used, and wrapping the endpoint hook like this ensures that this setting doesn't need to be repeated for every component that needs the endpoint.

Here's a simple React component which uses our endpoint hook to display a user table.

```TypeScript
import * as React from 'react';
import { useGetUsersInfinite } from '../state/controllers/user';

export const UserTable: React.FC = () => {
  const { data, setSize, size } = useGetUsersInfinite(10);

  return (
    <div className="home">
      <h2>User Table</h2>
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email Address</th>
          </tr>
        </thead>
        {!!data?.length && (
          <tbody>
            {data?.map((user) => (
              <tr key={user.id}>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>{user.email}</td>
              </tr>
            ))}
          </tbody>
        )}
      </table>
      <Button onClick={() => setSize((s) => s + 1)}>
        Load more
      </Button>
      <div>Current page: {size}</div>
    </div>
  );
};
```

## Configuration

The `useInfiniteQuery` hook receives a configuration object with the following properties

| Property       | Description                                                                                                                                                                                                                                                                                                                               |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `params`       | The params for the API call. In the case of `useInfiniteQuery`, the params must be passed as a function which receives the page size and the previous response data as argument, and returns the params object. This structure should allow for both number & cursor driven paging models (see [paging](paging.md) for more information.) |
| `fetchConfig`  | The `AxiosRequest` config for the API call, this will be merged with any global fetch config. (see [here](https://axios-http.com/docs/req_config) for full docs.)                                                                                                                                                                         |
| `fetchWrapper` | An optional fetch wrapper for this specific hook. NOTE: This will be called in place of any supplied [global fetch wrapper](global-fetch-wrapper.md) for maximum flexibility. If you want to use the global fetch wrapper, you must call it manually within the wrapper passed here.                                                      |
| `cacheKey`     | The cache key to store the response against, it can be a string param key, an array of param keys, or a function that generates the key from params, see [here](caching.md) for more info                                                                                                                                                 |
| `swrConfig`    | Additional config to send to SWR (like settings or fallback data for SSR.) This `SWRConfiguration` (see [here](https://swr.vercel.app/docs/api#options) for full docs.) will be merged with any global config                                                                                                                             |

## Returns

The `useInfiniteQuery` hook return exactly the same properties as the `useSWRInfinite` hook, which is documented [here](https://swr.vercel.app/docs/api#return-values). API SWR adds one additional property to this return type:

| Property             | Description                                                                                                 |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| `processingResponse` | The response returned by the global API processing hook. See [here](api-processing.md) for more information |
