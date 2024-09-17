/*
 * React hook for querying data on the client
 * --------------------------------------
 * Wraps the SWR hook, see here: https://swr.vercel.app
 */
import * as React from 'react';
import useSwrInfinite, { SWRInfiniteConfiguration } from 'swr/infinite';

import { readCacheKey } from '../utils/caching';

import { useClientFetch } from './useClientFetch';
import { useContentMemo } from './useContentMemo';
import { APIProcessingHook, FirstArg, GlobalFetchWrapperHook, IUseInfiniteQueryResponse, IUseQueryInfiniteConfig } from '../@types/global';

/**
 * A wrapper around the `useSwrInfinite` hook that includes a custom `fetch` function, `cacheKey` generator and SWR config.
 * @template TFunc - A function that returns a Promise with some data from the API.
 * @template TConfig - A configuration object to be passed to the fetch function.
 * @param {string} endpointId - The `controller.endpoint` ID
 * @param {TFunc} fetcher - The function to use for fetching data.
 * @param {IUseQueryInfiniteConfig<TFunc, TConfig>} hookConfig - An object containing the `cacheKey`, `params`, `config` and `swrConfig` options.
 * @param {APIProcessingHook} useProcessing - An optional API processing hook to render.
 * @param {GlobalFetchWrapperHook<TConfig>} useGlobalFetchWrapper - An optional fetch wrapper hook to render.
 * @param {SWRInfiniteConfiguration<unknown | undefined>} globalSwrInfiniteConfig - Global level infinite SWR config.
 * @returns {IUseInfiniteQueryResponse<TFunc, TProcessingResponse>} - The response from the `useSwrInfinite` hook augmented with the error and processing response.
 */
export const useInfiniteQuery = <
  TFunc extends (...args: Array<unknown>) => Promise<unknown>,
  TConfig extends object | undefined,
  TProcessingResponse,
>(
  endpointId: string,
  fetcher: TFunc,
  hookConfig?: IUseQueryInfiniteConfig<TFunc, TConfig>,
  useProcessing?: APIProcessingHook<TProcessingResponse>,
  useGlobalFetchWrapper?: GlobalFetchWrapperHook<TConfig, TFunc>,
  globalSwrInfiniteConfig?: SWRInfiniteConfiguration<unknown | undefined>
): IUseInfiniteQueryResponse<TFunc, TProcessingResponse> => {
  /** Used to fetch data on the client, calls the root fetcher with the params and config passed into the hook */
  const { clientFetch, error, processingResponse } = useClientFetch(
    endpointId,
    'query',
    hookConfig?.fetchConfig,
    fetcher,
    undefined,
    useProcessing,
    useGlobalFetchWrapper,
    hookConfig?.fetchWrapper
  );

  /** Content memo on the swr config to avoid dependency changes in SWR */
  const swrConfig = useContentMemo(hookConfig?.swrConfig);

  /** Content memo on the global swr config to avoid dependency changes in SWR */
  const globalSwrConfigMemo = useContentMemo(globalSwrInfiniteConfig);

  /** Reads the cacheKey value from the cacheKey definition sent to the hook, appending the params so that they can be read back when fetching */
  const cacheKeyValue = React.useCallback(
    (index: number, prevData?: any) => {
      const finalParams = hookConfig?.params?.(index, prevData);
      return [readCacheKey<Partial<FirstArg<TFunc>>>(endpointId, hookConfig?.cacheKey, finalParams), finalParams];
    },
    [hookConfig?.cacheKey, hookConfig?.params, endpointId]
  );

  /** Protect the root fetcher from causing dependency changes in SWR */
  const rootFetch = React.useCallback(
    async (key: [string, Partial<FirstArg<TFunc>> | undefined]) => {
      return clientFetch(key[1]);
    },
    [clientFetch, hookConfig?.params]
  );

  /** Protect the combined SWR config from causing dependency changes in SWR */
  const combinedSwrConfig = React.useMemo(
    () => ({ ...globalSwrConfigMemo, ...swrConfig }) as SWRInfiniteConfiguration<unknown | undefined>,
    [globalSwrConfigMemo, swrConfig]
  );

  /** Returns the native useSwrInfinite hook from the SWR library, see here: https://swr.vercel.app */
  return {
    ...useSwrInfinite(cacheKeyValue, rootFetch, combinedSwrConfig),
    error,
    processingResponse,
  } as IUseInfiniteQueryResponse<TFunc, TProcessingResponse>;
};
