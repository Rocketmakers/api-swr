# Rocketmakers - API SWR

[![TypeScript][typescript-badge]][typescript-url]
[![semantic-release][semantic-badge]][semantic-url]

`@rocketmakers/api-swr` is a TypeScript library that provides a convenient wrapper around [SWR](https://swr.vercel.app/) state management library. It allows developers to easily interface with a TypeScript API client while managing client side state.

---

## Installation

Install from npm using your package manage of choice:
- `npm install @rocketmakers/api-swr`
- `pnpm add @rocketmakers/api-swr`
- `yarn add @rocketmakers/api-swr`

---

## Usage

To get started with the `@rocketmakers/api-swr` library, create a new `apiFactory` for the desired fetch client (in this case, Axios) by calling one of the factory creation functions and passing in your global config, like so:

```TypeScript
import { openApiControllerFactory } from '@rocketmakers/api-swr';

export const apiFactory = openApiControllerFactory({
  basePath: 'https://my.example.api/dev',
});
```

The resulting factory can then be imported to create a set of tools for each controller in your API client. The recommended structure is to have a file for each controller. Here's an example of a state management controller file for a generic user management API controller - you can see the controller being created at the top, and then two query hooks. One to retrieve a list of users, and one to retrieve a single user:

```TypeScript
import { pagingConfig } from "@rocketmakers/api-swr"
import { apiFactory } from "../api.ts"
import { UserApi } from "example-api-client";

export const userApi = apiFactory.createAxiosOpenApiController("user", UserApi);

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
```

Here's how the above controller file can be extended to include CRUD mutation hooks which invalidate the appropriate cached data, causing it to be re-fetched by SWR if/when it needs to be:

```TypeScript
import { pagingConfig } from "@rocketmakers/api-swr"
import { apiFactory } from "../api.ts"
import { UserApi } from "example-api-client";
import { useSWRConfig } from 'swr';

export const userApi = apiFactory.createAxiosOpenApiController("user", UserApi);

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
  const { mutate: invalidate } = useSWRConfig();
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

export const useDeleteUser = () => {
  const { mutate: invalidate } = useSWRConfig();
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

## Mocking

The `@rocketmakers/api-swr` library provides a convenient way to register mock endpoints for testing. This makes it easier to simulate the behavior of your API during development and testing.

To create mock endpoints, you need to first register them. Each controller has a `registerMockEndpoints` function that you can use for this purpose. This function accepts an object where each key is the name of the endpoint you want to mock, and the corresponding value is the function that will be called when that endpoint is accessed.

Here is an example of how to register a mock endpoint:

```TypeScript
import { createSuccessResponse } from '@rocketmakers/api-swr';
import { UserApi } from "example-api-client";
import { createFakeUser } from './mockData.ts';

const userApi = apiFactory.createAxiosOpenApiController("user", UserApi);

userApi.registerMockEndpoints({
  getUser: async () => {
    return createSuccessResponse({ ...createFakeUser() });
  },
});
```

Remember that you need to register your mock endpoints before they are used. If you try to access a mock endpoint that hasn't been registered, an error will be thrown. This helps ensure that all endpoints are explicitly accounted for in your tests, which can make your tests more reliable and easier to understand.

[typescript-badge]: https://badges.frapsoft.com/typescript/code/typescript.svg?v=101
[semantic-badge]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[typescript-url]: https://github.com/microsoft/TypeScript
[semantic-url]: https://github.com/semantic-release/semantic-release