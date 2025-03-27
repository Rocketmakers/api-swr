import { useSWRConfig } from 'swr';
import * as React from 'react';
import { type ScopedMutator } from 'swr/_internal';

type OmitFirst<T extends unknown[]> = T extends [unknown, ...infer R] ? R : never;
type MutateInfiniteParams = [string, ...OmitFirst<Parameters<ScopedMutator>>];

/**
 * A hook to get the global mutate function from `swr` and a custom mutate function for infinite queries
 * @returns The global mutate function and the custom mutate function for infinite queries
 */
export const useCacheManager = () => {
  const { mutate, cache, ...restOfSwrConfig } = useSWRConfig();

  /**
   * A function to mutate infinite queries based on a key match
   * @param key The string key to match against (usually obtained via the `cacheKey` method on a controller endpoint)
   * @param rest The rest of the parameters to pass to `mutate`
   * @returns The result of the mutation
   */
  const mutateInfinite = React.useCallback<(...params: MutateInfiniteParams) => Promise<void>>(async (key, ...rest) => {
    await Promise.all(
      Array.from(cache.keys())
        .filter((k) => k.includes(key))
        .map((k) => mutate(k, ...rest))
    );
  }, []);

  /**
   * A function to perform a simple invalidation and request new data for a given key
   * This is just a wrapper around `mutate` with only the key argument, added for semantic clarity
   * @param key The key to invalidate
   * @returns The result of the SWR mutation
   */
  const invalidate = React.useCallback(
    (key: Parameters<ScopedMutator>[0]) => {
      return mutate(key);
    },
    [mutate]
  );

  /**
   * A function to perform a simple invalidation and request new data for a given key
   * Designed for use with infinite queries, the key only needs to be the `cacheKey` of the endpoint, the `startsWith` invalidator is not needed here.
   * This is just a wrapper around `mutate` with only the key argument, added for semantic clarity
   * @param key The key to invalidate
   * @returns The result of the SWR mutation
   */
  const invalidateInfinite = React.useCallback(
    (key: string) => {
      return mutateInfinite(key);
    },
    [mutateInfinite]
  );

  /**
   * A function to clear all cache entries
   * @returns The result of the SWR mutation
   */
  const clearAll = React.useCallback(async () => {
    await Promise.all(Array.from(cache.keys()).map((key) => mutate(key, undefined, { revalidate: false })));
  }, [cache, mutate]);

  return { mutate, mutateInfinite, invalidate, invalidateInfinite, cache, clearAll, ...restOfSwrConfig };
};
