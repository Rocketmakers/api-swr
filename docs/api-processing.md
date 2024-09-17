# The Processing Hook

Most applications have elements of response processing that occur off the back of every (or nearly every) API request. The most obvious example is error handling.

API SWR provides the opportunity to define a "processing hook" which will be injected into each of the three request hooks ([useQuery](use-query.md), [useInfiniteQuery](use-infinite-query.md) & [useMutation](use-mutation.md)).

The below code snippet shows how a central response processing hook can be used to show a "toast" notification when a server error occurs, and process any validation errors:

```TypeScript
import type { APIProcessingHook } from "@rocketmakers/api-swr"

interface ProcessingResponse {
  validationErrors: { key: string; message: string }[]
}

export const useApiProcessing: APIProcessingHook<ProcessingResponse> = ({ mode, isLoading, data, error, params }) => {
  // toast
  const dispatch = useDispatchToast()

  // validation errors
  const validationErrors = React.useMemo<ProcessingResponse["validationErrors"]>(() => {
    if (mode === "mutation" && error?.status === 422) {
      return error.payload ?? []
    }
    return []
  }, [error, mode])

  // server errors
  React.useEffect(() => {
    if (error?.status === 500) {
      dispatch({ type: "error", content: error.payload ?? "Unexpected Error" })
    }
  }, [dispatch, error])

  return { validationErrors }
}
```

Once defined, applying this processing hook to any of your API SWR controllers is as simple as passing it to the controller factory like this:

```TypeScript
import { axiosOpenApiControllerFactory } from '@rocketmakers/api-swr';
import { useApiProcessing } from "*Processing hook location.*"

export const apiFactory = axiosOpenApiControllerFactory({
  basePath: 'https://my.example.api/dev',
  useApiProcessing,
});
```

NOTE: Anything returned from the processing hook will be sent to the `processed` property of every API request hook that you use. This property will be strictly typed to be the same shape as your processing hook response:

```TypeScript
const { clientFetch, isLoading, processed } = userApi.updateUser.useMutation();

const validationErrors = processed?.validationErrors
```

## Configuration

The processing hook will receive a single object as its first argument. This object contains the following fields for use within your processing hook:

| Property     | Description                                                       |
| ------------ | ----------------------------------------------------------------- |
| `endpointId` | The `controllerKey.endpointKey` format endpoint ID of the request |
| `data`       | The request response data if any                                  |
| `error`      | The request response error if any                                 |
| `params`     | The params sent to the request                                    |
| `isLoading`  | Whether the request is currently pending or not                   |
| `mode`       | Informs whether the request originated from a query or mutation   |
