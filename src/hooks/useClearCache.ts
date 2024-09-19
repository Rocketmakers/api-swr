'use client';

import { useSWRConfig } from 'swr';

/**
 * A custom hook that provides a function to clear the SWR cache.
 *
 * @example
 * const clearCache = useClearCache();
 * clearCache(); // Clears the SWR cache
 */
export const useClearCache = () => {
  const { mutate } = useSWRConfig();

  const clearCache = async () => {
    await mutate(() => true, undefined, { revalidate: false });
  };

  return clearCache;
};
