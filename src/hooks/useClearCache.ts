'use client';

import * as React from 'react';
import { useSWRConfig } from 'swr';

/**
 * A custom hook that provides a function to clear the SWR cache.
 *
 * @example
 * const clearCache = useClearCache();
 * clearCache(); // Clears the SWR cache
 */
export const useClearCache = () => {
  const { mutate, cache } = useSWRConfig();

  React.useEffect(() => {
    return () => {
      // show deprecation warning
      // eslint-disable-next-line no-console -- legitimate deprecation warning
      console.warn(
        'useClearCache is deprecated and will be removed in the next major version of swr. Please use the `clearAll` function from the `useCacheManager` hook instead.'
      );
    };
  }, []);

  const clearCache = async () => {
    await Promise.all(Array.from(cache.keys()).map((key) => mutate(key, undefined, { revalidate: false })));
  };

  return clearCache;
};
