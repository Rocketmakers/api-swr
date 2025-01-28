'use client';

/*
 * React hook for querying data on the client
 * --------------------------------------
 * Wraps the SWR hook, see here: https://swr.vercel.app
 */
import * as React from 'react';
import useSwr, { type SWRConfiguration } from 'swr';

import { readCacheKey } from '../utils/caching';

import { useClientFetch } from './useClientFetch';
import { useContentMemo } from './useContentMemo';
import { IUseQueryConfig, APIProcessingHook, GlobalFetchWrapperHook, IUseQueryResponse, FirstArg } from '../@types/global';

/**
 * A wrapper around the `useSwr` hook that includes a custom `fetch` function, `cacheKey` generator and SWR config.
 * @template TFunc - A function that returns a Promise with some data from the API.
 * @template TConfig - A configuration object to be passed to the fetch function.
 * @param {string} endpointId - The `controller.endpoint` ID
 * @param {TFunc} fetcher - The function to use for fetching data.
 * @param {IUseQueryConfig<TFunc, TConfig>} hookConfig - An object containing the `cacheKey`, `params`, `config` and `swrConfig` options.
 * @param {APIProcessingHook} useProcessing - An optional API processing hook to render.
 * @param {GlobalFetchWrapperHook<TConfig>} useGlobalFetchWrapper - An optional fetch wrapper hook to render.
 * @param {SWRConfiguration<unknown | undefined>} globalSwrConfig - Global level SWR config.
 * @returns {SWRResponse<unknown>} - The response from the `useSwr` hook.
 */
export const useQuery = <TFunc extends (...args: Array<unknown>) => Promise<unknown>, TConfig extends object | undefined, TProcessingResponse>(
  endpointId: string,
  fetcher: TFunc,
  hookConfig?: IUseQueryConfig<TFunc, TConfig>,
  useProcessing?: APIProcessingHook<TProcessingResponse>,
  useGlobalFetchWrapper?: GlobalFetchWrapperHook<TConfig, TFunc>,
  globalSwrConfig?: SWRConfiguration<unknown | undefined>
): IUseQueryResponse<TFunc, TProcessingResponse> => {
  /** Used to fetch data on the client, calls the root fetcher with the params and config passed into the hook */
  const { clientFetch, error, processingResponse } = useClientFetch<TFunc, TConfig, TProcessingResponse>(
    endpointId,
    'query',
    hookConfig?.fetchConfig,
    fetcher,
    hookConfig?.params,
    useProcessing,
    useGlobalFetchWrapper,
    hookConfig?.fetchWrapper
  );

  /** Content memo on the swr config to avoid dependency changes in SWR */
  const swrConfig = useContentMemo(hookConfig?.swrConfig);

  /** Content memo on the global swr config to avoid dependency changes in SWR */
  const globalSwrConfigMemo = useContentMemo(globalSwrConfig);

  /** Reads the cacheKey value from the cacheKey definition sent to the hook */
  const cacheKeyValue = React.useMemo(() => {
    if (hookConfig?.waitFor === false) {
      return undefined;
    }
    return readCacheKey<FirstArg<TFunc>>(endpointId, hookConfig?.cacheKey, hookConfig?.params);
  }, [hookConfig?.cacheKey, hookConfig?.params, hookConfig?.waitFor, endpointId]);

  /** Protect the root fetcher from causing dependency changes in SWR */
  const rootFetch = React.useCallback(() => clientFetch(), [clientFetch]);

  /** Protect the combined SWR config from causing dependency changes in SWR */
  const combinedSwrConfig = React.useMemo(
    () => ({ ...globalSwrConfigMemo, ...swrConfig }) as SWRConfiguration<unknown | undefined>,
    [globalSwrConfigMemo, swrConfig]
  );

  /** Returns the native useSwr hook from the SWR library, see here: https://swr.vercel.app */
  return { ...useSwr(cacheKeyValue, rootFetch, combinedSwrConfig), error, processingResponse } as IUseQueryResponse<TFunc, TProcessingResponse>;
};
