# useMutation

A hook for performing POST/PUT/PATCH/DELETE requests. This hook does not directly interface with swr because mutation responses should never be cached, but it does provide a convenient wrapper for mutation requests which interfaces with the following API SWR features:

- Interfaces with API SWR specific processes like the global [useApiProcessing](api-processing.md) hook and [fetch wrappers](global-fetch-wrapper.md).
- Interfaces with the API SWR [request mocking](mocking.md) library.

## Example

Like all API SWR endpoint hooks, the `useMutation` hook _can_ be consumed directly by a React component. However, we recommend wrapping each endpoint hook so that the [invalidation](caching.md) and business logic for the endpoint can be centralized in a readable way:

```TypeScript
export const useUpdateUser = () => {
  const { mutate: invalidate } = useSWRConfig();
  const { clientFetch, ...rest } = userApi.updateUser.useMutation();

  const updateUser = React.useCallback(async (user: IUser) => {
    const response = await clientFetch({ user });
    if (response.data) {
      invalidate(userApi.getUsers.startsWithInvalidator());
      invalidate(userApi.getUser.cacheKey(response.data.id));
    }
    return response;
  }, [clientFetch]);

  return { updateUser, ...rest };
};
```

In the above example, query data is being invalidated following a successful mutation, you can read more about cache invalidation [here](caching.md). It's important that this invalidation logic is _always_ in place when this endpoint is used, and wrapping the endpoint hook like this ensures that this setting doesn't need to be repeated for every component that needs the endpoint.

Here's a simple React component which uses our endpoint hook to display a user update form.

_NOTE: This example uses the [Armstrong](https://github.com/Rocketmakers/armstrong-edge) form binding library, but any form binding logic can be used here._

```TypeScript
import * as React from 'react';
import { useGetUser, useUpdateUser } from '../state/controllers/user';

interface IProps {
  userId: string;
}

export const UserForm: React.FC<IProps> = ({ userId }) => {
  const { data } = useGetUser(userId);
  const { updateUser, isLoading } = useUpdateUser();

  const { formProp, formState } = useForm<MemoryServer.IUser>(
    data ?? {
      id: testUser,
      email: '',
      firstName: '',
      lastName: '',
    }
  );

  return (
    <div className="home">
      <Input type="text" bind={formProp('firstName').bind()} />
      <Input type="text" bind={formProp('lastName').bind()} />
      <Input type="email" bind={formProp('email').bind()} />
      <Button pending={isLoading} onClick={() => updateUser(testUser, { ...formState })}>
        Update
      </Button>
    </div>
  );
};
```

## Configuration

The `useMutation` hook receives a configuration object with the following properties

| Property       | Description                                                                                                                                                                                                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `params`       | The params for the API call (usually a combination route params, query string params & body). A re-fetch will be triggered automatically if the values in here change                                                                                                                |
| `fetchConfig`  | The `AxiosRequest` config for the API call, this will be merged with any global fetch config. (see [here](https://axios-http.com/docs/req_config) for full docs.)                                                                                                                    |
| `fetchWrapper` | An optional fetch wrapper for this specific hook. NOTE: This will be called in place of any supplied [global fetch wrapper](global-fetch-wrapper.md) for maximum flexibility. If you want to use the global fetch wrapper, you must call it manually within the wrapper passed here. |

## Returns

| Property             | Description                                                                                                                                                                                                 |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `processingResponse` | The response returned by the global API processing hook. See [here](api-processing.md) for more information                                                                                                 |
| `clientFetch`        | The async function which performs the mutation. It takes `execParams` as the params for the request as a typed param object and returns a promise containing the unwrapped response data from the mutation. |
| `isLoading`          | Whether the request is currently pending or not                                                                                                                                                             |
| `data`               | The request response data if any                                                                                                                                                                            |
| `error`              | The request response error if any                                                                                                                                                                           |
