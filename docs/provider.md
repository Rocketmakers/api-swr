# The Provider

To allow all endpoint hooks to read the global cache, your app should be wrapped with the API SWR provider.

_NOTE: If you are an [Armstrong](https://github.com/Rocketmakers/armstrong-edge) user, it's useful to make sure the Armstrong provider is outside the API SWR provider. This will allow you to dispatch Armstrong toast from your API SWR processing hook._

## Example

```TypeScript
import * as React from 'react';
import { ApiSwrProvider } from '@rocketmakers/api-swr';

export const App: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <ApiSwrProvider>{children}</ApiSwrProvider>;
};
```

## Configuration

The API SWR provider is a wrapper for the `<SWRConfig>` component, which is documented [here](https://swr.vercel.app/docs/global-configuration#cache-provider).

_NOTE: API SWR will set up an empty provider for you by default with the following value:_

```TypeScript
{ provider: () => new Map() }
```

_This can be overridden with a custom provider using the `value` property of the `ApiSwrProvider` component._
