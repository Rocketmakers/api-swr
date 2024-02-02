# Rocketmakers - API SWR

[![TypeScript][typescript-badge]][typescript-url]
[![react][react-badge]][react-url]
[![vercel][vercel-badge]][vercel-url]

`@rocketmakers/api-swr` is a TypeScript library that provides a convenient React wrapper around [SWR](https://swr.vercel.app/) state management library. It allows developers to easily interface with a TypeScript API client while managing client side state.

---

## Installation

Install from npm using your package manage of choice:

- `npm install @rocketmakers/api-swr`
- `pnpm add @rocketmakers/api-swr`
- `yarn add @rocketmakers/api-swr`

---

## Core concepts

1. **Controller factory** - one created for each API, used to create a "controller" for each tag within the API client.
2. **Controller** - one created for each tag within the API client, used to create the endpoint hooks.
3. **Endpoint hook** - a hook consumed by React components, used to retrieve data, run side effects, and manage cache.

---

## Full Documentation

### Setup

- [Recommended file structure](docs/file-structure.md)
- [The Provider](docs/provider.md)
- [Custom API client](docs/custom-api-client.md) _(only relevant if not using a generated OpenAP client, otherwise see quick start below)_

### Factories & controllers

- [Controller Factory](docs/controller-factory.md)
- [Controller](docs/controller.md)

### Endpoint hooks

- [useQuery](docs/use-query.md) _(for GET requests)_
- [useMutation](docs/use-query.md) _(for POST/PUT/PATCH/DELETE requests)_
- [useInfiniteQuery](docs/use-infinite-query.md) _(for paged GET requests with infinite loading)_

### Complex queries

- [Caching](docs/caching.md) (coming soon!)
- [Paging](docs/paging.md) (coming soon!)

### Advanced tools

- [useApiProcessing](docs/api-processing.md) (coming soon!)
- [useGlobalFetchWrapper](docs/global-fetch-wrapper.md) (coming soon!)

---

## Quick start

This quick start guide assumes you're working from a generated TypeScript OpenAPI client, don't worry if you're not though, it's dead easy to work from a hand written client, see [here](docs/custom-api-client.md).

### 1. Wrap your app with the API SWR provider

To allow all endpoint hooks to read the global cache, your app should be wrapped with the API SWR provider.

_NOTE: If you are an [Armstrong](https://github.com/Rocketmakers/armstrong-edge) user, it's useful to make sure the Armstrong provider is outside the API SWR provider. This will allow you to dispatch Armstrong toast from your API SWR processing hook._

```TypeScript
import * as React from 'react';
import { ApiSwrProvider } from '@rocketmakers/api-swr';

export const App: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <ApiSwrProvider>{children}</ApiSwrProvider>;
};
```

### 2. Create a controller factory

API SWR requires a controller factory for each API that you want to integrate. This factory is used for creating controllers. You should pass a base URL for the deployed API.

```TypeScript
import { openApiControllerFactory } from '@rocketmakers/api-swr';

export const apiFactory = openApiControllerFactory({
  basePath: 'https://my.example.api/dev',
});
```

### 3. Create a controller

One controller should be created for each tag within the OpenAPI client. Tags are often used for splitting generated clients by backend controller, (e.g. "auth", "user", "product" etc.) If the generated client does not use tags, it will export a single class called `DefaultApi`, and your app will only need a single controller.

```TypeScript
import { apiFactory } from "../controllerFactory.ts"
import { UserApi } from "example-api-client";

export const userApi = apiFactory.createAxiosOpenApiController("user", UserApi);
```

### 4. Create an endpoint hook

There are multiple hook types available (see full docs), but for this quick start guide, here's a simple `useQuery` hook for retrieving a user by ID.

```TypeScript
export const useGetUser = (userId: string) => {
  return userApi.getUser.useQuery({
    cacheKey: 'userId',
    params: { userId }
  })
};
```

### 5. Consume your endpoint hook in a React component

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

[typescript-badge]: https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white
[react-badge]: https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB
[vercel-badge]: https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white
[typescript-url]: https://github.com/microsoft/TypeScript
[react-url]: https://react.dev
[vercel-url]: https://swr.vercel.app
