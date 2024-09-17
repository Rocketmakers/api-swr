/**
 * Utility functions for caching.
 * --------------------------------------
 * These functions are designed to facilitate param driven caching
 */

import { CacheKey } from '../@types/global';

/**
 * Concatenates a cache key string from an array of string arguments.
 * @param {...(string | undefined)} args - An array of string arguments.
 * @returns {string} - The concatenated cache key string.
 */
export const cacheKeyConcat = (...args: Array<string | undefined>): string => {
  return args.filter((arg) => !!arg).join('.');
};

/**
 * Returns the final concatenated cache key for an API call by unwrapping the defined cache key.
 * NOTE: If any of the cache key params are falsy, this function will return undefined so that the API call is held back until all the cache key params are ready
 * @param {string} [endpointId] - The ID of the API endpoint.
 * @param {CacheKey<TArgs>} [cacheKey] - The cache key, which can be a string, an array of strings, or a function that receives the params and returns the built cache key.
 * @param {TArgs} [params] - The parameters for the API call.
 * @returns {string|undefined} - The final concatenated cache key, or undefined if the cache key params are not all present.
 */
export const readCacheKey = <TArgs>(endpointId?: string, cacheKey?: CacheKey<TArgs>, params?: TArgs): string | undefined => {
  switch (typeof cacheKey) {
    case 'function':
      const funcResult = cacheKey(params);
      if (!funcResult) {
        return undefined;
      }
      return cacheKeyConcat(endpointId, funcResult);
    case 'string':
      const lookupResult = `${(params?.[cacheKey] as string | undefined) ?? ''}`;
      if (!lookupResult) {
        return undefined;
      }
      return cacheKeyConcat(endpointId, lookupResult);
    case 'object':
      if (Array.isArray(cacheKey)) {
        const lookupResults = cacheKey.map((key) => `${(params?.[key] as string | undefined) ?? ''}`).filter((key) => !!key);
        return cacheKeyConcat(endpointId, ...lookupResults);
      }
      return undefined;
    default:
      return endpointId;
  }
};
