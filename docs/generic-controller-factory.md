# Generic Controller Factory

- There should be one controller factory per API.
- Receives core config.
- Used to create API SWR controllers.
- Each controller factory should live in it's own file to avoid dependency cycles (see [file structure](file-structure.md).)

## Example

```TypeScript
import { genericApiControllerFactory } from '@rocketmakers/api-swr';

interface IConfig {
  basePath: string
}

export const apiFactory = genericApiControllerFactory<IConfig, void>({
  globalFetchConfig: {
    basePath: 'https://my.example.api/dev'
  }
});
```

## Configuration

The controller factory receives a single config object which has the following optional properties

| Name                    | Description                                                                                                                                                                                                                                                                                                                             | Default |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `globalFetchConfig`     | This config will be passed as the second argument to all endpoint methods in the API Client. Can be overridden at controller level and at fetch level.                                                                                                                                                                                  | -       |
| `swrConfig`             | Global level `SWRConfiguration` (see [here](https://swr.vercel.app/docs/api#options) for full docs.) This config will be added to every instance of the [useQuery](use-query.md) hook and combined with any config passed at endpoint level.                                                                                            | -       |
| `swrInfiniteConfig`     | Global level `SWRInfiniteConfiguration` (see [here](https://swr.vercel.app/docs/pagination.en-US#parameters) under `options` for full docs.) This config will be added to every instance of the [useInfiniteQuery](use-query.md) hook and combined with any config passed at endpoint level.                                            | -       |
| `enableMocking`         | Whether to use the supplied [mocked endpoints](mocking.md) instead of real endpoints for all requests, resulting in no genuine API calls being made. If this property is `true`, you **must** have a mock endpoint registered for every endpoint used in your app, otherwise an error will be thrown.                                   | `false` |
| `useApiProcessing`      | A reference to the global API processing hook. This hook is injected into every instance of an endpoint hook. It receives various parameters and is designed to act as React lifecycle-level middleware. See [here](api-processing.md) for full docs.                                                                                   | -       |
| `useGlobalFetchWrapper` | A reference to the global API fetch wrapper hook. This hook returns a function which will wrap every async fetch request made by API SWR. It receives the original fetch request, params, and config. It's designed to allow additional async processing middleware for every fetch. See [here](global-fetch-wrapper.md) for full docs. | -       |

## Returns

An object which contains a function property for creating API SWR controllers:

| Name                         | Description                                                                                                                                                                                                                                                                                                                                     |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createGenericApiController` | Factory function for creating new API SWR controllers. The generic controller factory is designed to work from a generic API client which must conform to a specific structure (see [here](generic-api-client.md) for more details.) Creating controllers and endpoint hooks from a generic factory is documented [here](generic-controller.md) |

The returned value of the controller factory should be imported into each of your controller files.
