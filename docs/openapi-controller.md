# OpenAPI Controller

- There should be one controller for each tag (or API client controller class.) These classes within the API Client are often tied to backend controllers (things like "auth", "user", "product" etc.) but they can be anything depending on the API in question. Some OpenAPI clients only export a single controller class called `DefaultApi`, if this is the case you'll only need one controller file.
- Receives a `controllerKey` and an OpenAPI client controller class.
- Used to create API SWR endpoint hooks.
- Each controller should live in a separate file alongside its endpoint hooks to avoid dependency cycles (see [file structure](file-structure.md).)

## Example

The below example shows a `userApi` controller alongside a set of example CRUD endpoint hooks.

```TypeScript
import { pagingConfig, useCacheManager } from "@rocketmakers/api-swr"
import { apiFactory } from "../controllerFactory.ts"
import { UserApi } from "example-api-client";

/** CONTROLLER **/

export const userApi = apiFactory.createAxiosOpenApiController("user", UserApi);

/** ENDPOINT HOOKS **/

export const useGetUsers = (page: number, pageSize: number) => {
  return userApi.getUsers.useQuery({
    cacheKey: ['page', 'pageSize'],
    params: { page, pageSize },
    swrConfig: { keepPreviousData: true },
  });
};

export const useGetUser = (userId: string) => {
  return userApi.getUser.useQuery({
    cacheKey: 'userId',
    params: { userId }
  })
};

export const useCreateUser = () => {
  const { invalidate } = useCacheManager();
  const { clientFetch, ...rest } = userApi.createUser.useMutation();

  const createUser = React.useCallback(async (user: ICreateUser) => {
    const response = await clientFetch({ user });
    if (response) {
      invalidate(userApi.getUsers.startsWithInvalidator());
    }
    return response;
  }, [clientFetch]);

  return { createUser, ...rest };
};

export const useUpdateUser = () => {
  const { invalidate } = useCacheManager();
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

export const useDeleteUser = () => {
  const { invalidate } = useCacheManager();
  const { clientFetch, ...rest } = userApi.deleteUser.useMutation();

  const deleteUser = React.useCallback(async (id: string) => {
    const response = await clientFetch({ id });
    if (response) {
      invalidate(userApi.getUsers.startsWithInvalidator());
      invalidate(userApi.getUser.cacheKey(id));
    }
    return response;
  }, [clientFetch]);

  return { deleteUser, ...rest };
};
```

## Configuration

The `createAxiosOpenApiController` method receives two mandatory arguments

| Name                    | Description                                                                                                                                               |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `controllerKey`         | A string key for the controller. This key will be used to prefix all cache keys to ensure caching uniqueness                                              |
| `OpenApiClass`          | A reference to the API client controller class. This must either be a generated OpenAPI class, or a custom class that conforms to the required structure. |
| `openApiConfigOverride` | This config will be passed as the first argument to the OpenAPI constructor, passing it here will override any config passed at API factory level         |

## Returns

An object which contains factory properties matching the structure of the passed in API client controller class. These properties can be used to create individual endpoint hooks, as well as providing a suite of useful tools.

### Properties of a controller

| Name                                 | Description                                                                                        |
| ------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `registerMockEndpoints`              | A function used to provide mock endpoints for this controller. See [here](mocking.md) for details. |
| `[endpointName]: EndpointProperties` | A per-endpoint dictionary of properties documented below.                                          |

### Properties of an endpoint

| Property                | Description                                                                                                                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `controllerKey`         | The string name given to the controller - used as the first part of the cache key for data separation                                                                                                                                |
| `endpointKey`           | The string name of the endpoint (derived from the controller object) - used as the second part of the cache key for data separation                                                                                                  |
| `endpointId`            | The `controllerKey.endpointKey` format endpoint ID of the request                                                                                                                                                                    |
| `fetch`                 | The raw fetch method for actually requesting the data from the API. This is useful for server side rendering                                                                                                                         |
| `cacheKey`              | Function that returns the cacheKey specific to the controller/endpoint with an optional addition, in the format: `controllerKey.endpointKey.additionalCacheKey`. Useful for invalidating cache, see [here](caching.md) for more info |
| `startsWithInvalidator` | Returns a `swr` mutate matcher function which will invalidate on the basis of "starts with" on the root cache key. Useful for invalidating paged/filtered queries, see [here](paging.md) for more info.                              |
| `useQuery`              | A hook for performing GET queries - wrapped version of the `useSwr` hook returned from the SWR library. See [here](use-query.md) for full docs.                                                                                      |
| `useInfiniteQuery`      | A hook for performing infinite loader GET queries - wrapped version of the `useInfiniteSwr` hook returned from the SWR library. See [here](use-infinite-query.md) for full docs.                                                     |
| `useMutation`           | A hook for performing POST/PATCH/PUT/DELETE mutations - interfaces with global processing. See [here](use-mutation.md) for full docs.                                                                                                |
