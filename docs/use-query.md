# useQuery

A hook for performing GET requests. It's an augmented version of the `useSwr` hook returned from the SWR library, see [here](https://swr.vercel.app/docs/api) for `useSwr` docs.

How does `useQuery` differ from `useSwr`?

- Applies a more advanced caching logic with controller/endpoint separation and a "cache by param" shortcut. See [here](caching.md) for more info.
- Interfaces with API SWR specific processes like the global [useApiProcessing](api-processing.md) hook and [fetch wrappers](global-fetch-wrapper.md).
- Interfaces with the API SWR [request mocking](mocking.md) library.

## Example

Like all API SWR endpoint hooks, the `useQuery` hook _can_ be consumed directly by a React component. However, we recommend wrapping each endpoint hook so that the [caching](caching.md) and business logic for the endpoint can be centralized in a readable way:

```TypeScript
export const useGetUser = (userId: string) => {
  return userApi.getUser.useQuery({
    cacheKey: 'userId',
    params: { userId }
  })
};
```

In the above example, the `cacheKey` has been configured to read the `userId` parameter. It's important that this caching logic is _always_ in place when this endpoint is used, and wrapping the endpoint hook like this ensures that this setting doesn't need to be repeated for every component that needs the endpoint.

Here's a simple React component which uses our endpoint hook to display a user card.

```TypeScript
import * as React from 'react';
import { useGetUser } from '../state/controllers/user';

interface IProps {
  userId: string;
}

export const UserCard: React.FC<IProps> = ({ userId }) => {
  const { data } = useGetUser(userId);
  return (
    <div>
      <img src={data?.profilePic} />
      <h2>{data?.name}</h2>
    </div>
  );
}
```

## Configuration

The `useQuery` hook receives a configuration object with the following properties

| Property        | Description                                                                                                                                                                                                                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `params`        | The params for the API call (usually a combination route params, query string params & body). A re-fetch will be triggered automatically if the values in here change                                                                                                                                  |
| `fetchConfig`   | The `AxiosRequest` config for the API call, this will be merged with any global fetch config. (see [here](https://axios-http.com/docs/req_config) for full docs.)                                                                                                                                      |
| `fetchWrapper`  | An optional fetch wrapper for this specific hook. NOTE: This will be called in place of any supplied [global fetch wrapper](global-fetch-wrapper.md) for maximum flexibility. If you want to use the global fetch wrapper, you must call it manually within the wrapper passed here.                   |
| `cacheKey`      | The cache key to store the response against, it can be a string param key, an array of param keys, or a function that generates the key from params, see [here](caching.md) for more info                                                                                                              |
| `swrConfig`     | Additional config to send to SWR (like settings or fallback data for SSR.) This `SWRConfiguration` (see [here](https://swr.vercel.app/docs/api#options) for full docs.) will be merged with any global config                                                                                          |
| `waitFor`       | An optional boolean. If this property is false, the query fetch will wait until it becomes true or undefined. Useful for holding back queries until conditions are met.                                                                                                                                |
| `enableMocking` | Whether to use the supplied [mocked endpoints](mocking.md) instead of real endpoints for this hook only, resulting in no genuine API calls being made. If this property is `true`, you **must** have a mock endpoint registered for every endpoint used in your app, otherwise an error will be thrown |

## Returns

The `useQuery` hook return exactly the same properties as the `useSwr` hook, which is documented [here](https://swr.vercel.app/docs/api#return-values). API SWR adds one additional property to this return type:

| Property             | Description                                                                                                 |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| `processingResponse` | The response returned by the global API processing hook. See [here](api-processing.md) for more information |
