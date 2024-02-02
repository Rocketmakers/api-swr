# Mocking

The `@rocketmakers/api-swr` library provides a convenient way to register mock endpoints for testing. This makes it easier to simulate the behavior of your API during development and testing.

To create mock endpoints, you need to first register them. Each controller has a `registerMockEndpoints` function that you can use for this purpose. This function accepts an object where each key is the name of the endpoint you want to mock, and the corresponding value is the function that will be called when that endpoint is accessed.

## Example

Here is a simple example of how to register a mock endpoint:

```TypeScript
import { createSuccessResponse } from '@rocketmakers/api-swr';
import { UserApi } from "example-api-client";
import { createFakeUser } from './mockData.ts';

const userApi = apiFactory.createAxiosOpenApiController("user", UserApi);

userApi.registerMockEndpoints({
  getUser: async (params, config) => {
    return createSuccessResponse({ ...createFakeUser(params.id) });
  },
});
```

## Activating mock endpoints

To instruct API SWR to use mock endpoints instead of real endpoints, set `enableMocking` to `true` when setting up your [controller factory](controller-factory.md):

```TypeScript
import { openApiControllerFactory } from '@rocketmakers/api-swr';

export const apiFactory = openApiControllerFactory({
  basePath: 'https://my.example.api/dev',
  enableMocking: true
});
```

_NOTE: Remember that you need to register your mock endpoints before they are used. If you try to access a mock endpoint that hasn't been registered, an error will be thrown. This helps ensure that all endpoints are explicitly accounted for in your tests, which can make your tests more reliable and easier to understand._

## Configuration

Each mock endpoint function receives two parameters:

| Name     | Description                                        |
| -------- | -------------------------------------------------- |
| `params` | The parameters sent to the fetch request           |
| `config` | The `AxiosRequestConfig` sent to the fetch request |

These can be used (if necessary) to make your test data more specific to the request
