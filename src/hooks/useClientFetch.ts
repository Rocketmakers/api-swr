/*
 * React hook for fetching data on the client
 * --------------------------------------
 * Allows for centralized processing on all API calls
 */
import * as React from 'react';

import { useContentMemo } from './useContentMemo';
import type { APIProcessingHook, FetchWrapper, FirstArg, GlobalFetchWrapperHook, HookRequestMode } from '../@types/global';

/**
 * Root hook for fetching data on the client.
 * - Used by both `useQuery` and `useMutation`
 * - Renders the global API Processing hook.
 * @param endpointId The `controller.endpoint` formatted endpoint ID
 * @param mode The hook mode (either `query` or `mutation`)
 * @param fetchConfigArg The fetch config to be sent as the second arg to the fetch method
 * @param fetcher The fetch method for performing the request
 * @param paramsArg The fetch params to be sent as the first arg to the fetch method
 * @param useApProcessing The global API Processing hook if defined.
 * @param globalFetchWrapperHook An optional hook which returns a wrapper around the fetcher method.
 * @param localFetchWrapper An optional hook specific fetch wrapper function to use instead of the global hook.
 * @returns a client side fetch function and some other useful state (including the response from the processing hook)
 */
export const useClientFetch = <TFunc extends (...args: Array<unknown>) => Promise<unknown>, TConfig extends object | undefined, TProcessingResponse>(
  endpointId: string,
  mode: HookRequestMode,
  fetchConfig: TConfig | undefined,
  fetcher: TFunc,
  paramsArg?: Partial<FirstArg<TFunc>>,
  useApProcessing?: APIProcessingHook<TProcessingResponse>,
  globalFetchWrapperHook?: GlobalFetchWrapperHook<TConfig, TFunc>,
  localFetchWrapper?: FetchWrapper<TFunc, TConfig>
) => {
  const [data, setData] = React.useState<unknown | undefined>();
  const [error, setError] = React.useState<unknown>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [stateParams, setStateParams] = React.useState<FirstArg<TFunc>>();

  const params = useContentMemo(paramsArg);

  const fetchWrapper = globalFetchWrapperHook?.();

  /** Used to fetch data on the client, calls the root fetcher with the params and config passed into the hook */
  const clientFetch = React.useCallback(
    async (execParams?: Partial<FirstArg<TFunc>>) => {
      try {
        setError(undefined);
        setIsLoading(true);
        const finalParams = { ...(params ?? {}), ...(execParams ?? {}) } as FirstArg<TFunc>;
        setStateParams(finalParams);
        let response: unknown;
        const wrapper = (localFetchWrapper ?? fetchWrapper) as FetchWrapper<TFunc, TConfig>;
        if (wrapper) {
          response = await wrapper({ rootFetcher: fetcher, params: finalParams, mode, config: fetchConfig, endpointId });
        } else {
          response = await fetcher(finalParams, fetchConfig);
        }
        setData(response);
        return response;
      } catch (caughtError) {
        setError(caughtError);
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [params, localFetchWrapper, fetchWrapper, fetcher, mode, fetchConfig, endpointId]
  );

  /** Render the processing hook if it exists */
  const processingResponse = useApProcessing?.({
    data: data as unknown,
    mode,
    isLoading,
    endpointId,
    params: stateParams,
    error,
  });

  return { processingResponse, clientFetch, data, error, isLoading };
};
