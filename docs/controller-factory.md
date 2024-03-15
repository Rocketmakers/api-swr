# Controller Factory

- There should be one controller factory per API.
- Receives core config.
- Used to create API SWR controllers.
- Each controller factory should live in it's own file to avoid dependency cycles (see [file structure](file-structure.md).)

## Example

```TypeScript
import { openApiControllerFactory } from '@rocketmakers/api-swr';

export const apiFactory = openApiControllerFactory({
  basePath: 'https://my.example.api/dev',
});
```

## Configuration

The controller factory receives a single config object which has the following optional properties

| Name                    | Description                                                                                                                                                                                                                                                                                                                             | Default |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `basePath`              | The base URL path for your API. This should be an absolute URL and is passed to each endpoint method of the API client to form the final URL                                                                                                                                                                                            | -       |
| `openApiConfig`         | This config will be passed as the first argument to the OpenAPI constructor. Can be overridden at controller level.                                                                                                                                                                                                                     | -       |
| `swrConfig`             | Global level `SWRConfiguration` (see [here](https://swr.vercel.app/docs/api#options) for full docs.) This config will be added to every instance of the [useQuery](use-query.md) hook and combined with any config passed at endpoint level.                                                                                            | -       |
| `swrInfiniteConfig`     | Global level `SWRInfiniteConfiguration` (see [here](https://swr.vercel.app/docs/pagination.en-US#parameters) under `options` for full docs.) This config will be added to every instance of the [useInfiniteQuery](use-query.md) hook and combined with any config passed at endpoint level.                                            | -       |
| `enableMocking`         | Whether to use the supplied [mocked endpoints](mocking.md) instead of real endpoints for all requests, resulting in no genuine API calls being made. If this property is `true`, you **must** have a mock endpoint registered for every endpoint used in your app, otherwise an error will be thrown.                                   | `false` |
| `useApiProcessing`      | A reference to the global API processing hook. This hook is injected into every instance of an endpoint hook. It receives various parameters and is designed to act as React lifecycle-level middleware. See [here](api-processing.md) for full docs.                                                                                   | -       |
| `useGlobalFetchWrapper` | A reference to the global API fetch wrapper hook. This hook returns a function which will wrap every async fetch request made by API SWR. It receives the original fetch request, params, and config. It's designed to allow additional async processing middleware for every fetch. See [here](global-fetch-wrapper.md) for full docs. | -       |

## Returns

An object which contains a function property for creating API SWR controllers:

| Name                           | Description                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createAxiosOpenApiController` | Factory function for creating new API SWR controllers. At the moment, the only controller factory available is designed to work with an OpenAPI generated client, and the [axios](https://axios-http.com/docs/intro) fetch library, but API SWR is structured so that alternative controller factories could easily be added in the future. |

The returned value of the controller factory should be imported into each of your controller files.
