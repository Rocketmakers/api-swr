/*
 * React hook for querying data on the client
 * --------------------------------------
 * Wraps the SWR hook, see here: https://swr.vercel.app
 */
import * as React from 'react';
import useSwr, { SWRConfiguration, SWRResponse } from 'swr';

import type { APIProcessingHook, FirstArg, IUseQueryConfig, UnwrapAxiosResponse } from '../types';
import { readCacheKey } from '../utils/caching';

import { useClientFetch } from './useClientFetch';
import { useContentMemo } from './useContentMemo';

/**
 * A wrapper around the `useSwr` hook that includes a custom `fetch` function, `cacheKey` generator and SWR config.
 * @template TFunc - A function that returns a Promise with some data from the API.
 * @template TConfig - A configuration object to be passed to the fetch function.
 * @param {string} endpointId - The `controller.endpoint` ID
 * @param {TFunc} fetcher - The function to use for fetching data.
 * @param {IUseQueryConfig<TFunc, TConfig>} hookConfig - An object containing the `cacheKey`, `params`, `config` and `swrConfig` options.
 * @param {APIProcessingHook} useProcessing - An optional API processing hook to render.
 * @param {SWRConfiguration<UnwrapAxiosResponse<TFunc> | undefined>} globalSwrConfig - Global level SWR config.
 * @returns {SWRResponse<UnwrapAxiosResponse<TFunc>>} - The response from the `useSwr` hook.
 */
export const useQuery = <TFunc extends (...args: Array<unknown>) => Promise<UnwrapAxiosResponse<TFunc>>, TConfig>(
  endpointId: string,
  fetcher: TFunc,
  hookConfig?: IUseQueryConfig<TFunc, TConfig>,
  useProcessing?: APIProcessingHook,
  globalSwrConfig?: SWRConfiguration<UnwrapAxiosResponse<TFunc> | undefined>
): SWRResponse<UnwrapAxiosResponse<TFunc> | undefined> => {
  /** Used to fetch data on the client, calls the root fetcher with the params and config passed into the hook */
  const { clientFetch, error } = useClientFetch(endpointId, 'query', hookConfig?.fetchConfig, fetcher, hookConfig?.params, useProcessing);

  /** Content memo on the swr config to avoid dependency changes in SWR */
  const swrConfig = useContentMemo(hookConfig?.swrConfig);

  /** Reads the cacheKey value from the cacheKey definition sent to the hook */
  const cacheKeyValue = React.useMemo(() => {
    return readCacheKey<Partial<FirstArg<TFunc>>>(endpointId, hookConfig?.cacheKey, hookConfig?.params);
  }, [hookConfig?.cacheKey, hookConfig?.params, endpointId]);

  /** Protect the root fetcher from causing dependency changes in SWR */
  const rootFetch = React.useCallback(() => clientFetch(), [clientFetch]);

  /** Protect the combined SWR config from causing dependency changes in SWR */
  const combinedSwrConfig = React.useMemo(() => ({ ...globalSwrConfig, ...swrConfig }), [globalSwrConfig, swrConfig]);

  /** Returns the native useSwr hook from the SWR library, see here: https://swr.vercel.app */
  return { ...useSwr(cacheKeyValue, rootFetch, combinedSwrConfig), error };
};
