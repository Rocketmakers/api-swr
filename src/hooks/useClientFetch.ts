/*
 * React hook for fetching data on the client
 * --------------------------------------
 * Allows for centralized processing on all API calls
 */
import * as React from 'react';

import type { APIProcessingHook, FirstArg, HookRequestMode, UnwrapAxiosResponse } from '../types';

import { useContentMemo } from './useContentMemo';

/**
 * Root hook for fetching data on the client.
 * - Used by both `useQuery` and `useMutation`
 * - Renders the global API Processing hook.
 * @param endpointId The `controller.endpoint` formatted endpoint ID
 * @param mode The hook more (either `query` or `mutation`)
 * @param fetchConfigArg The fetch config to be sent as the second arg to the fetch method
 * @param fetcher The fetch method for performing the request
 * @param paramsArg The fetch params to be sent as the first arg to the fetch method
 * @param useApProcessing The global API Processing hook if defined.
 * @returns a client side fetch function and some other useful state (including the response from the processing hook)
 */
export const useClientFetch = <TFunc extends (...args: Array<unknown>) => Promise<UnwrapAxiosResponse<TFunc>>, TConfig>(
  endpointId: string,
  mode: HookRequestMode,
  fetchConfigArg: TConfig | undefined,
  fetcher: TFunc,
  paramsArg?: Partial<FirstArg<TFunc>>,
  useApProcessing?: APIProcessingHook
) => {
  const [data, setData] = React.useState<UnwrapAxiosResponse<TFunc> | undefined>();
  const [error, setError] = React.useState<unknown>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [stateParams, setStateParams] = React.useState<FirstArg<TFunc>>();

  const params = useContentMemo(paramsArg);
  const fetchConfig = useContentMemo(fetchConfigArg);

  /** Used to fetch data on the client, calls the root fetcher with the params and config passed into the hook */
  const clientFetch = React.useCallback(
    async (execParams?: Partial<FirstArg<TFunc>>) => {
      try {
        setError(undefined);
        setIsLoading(true);
        const finalParams = { ...(params ?? {}), ...(execParams ?? {}) } as FirstArg<TFunc>;
        setStateParams(finalParams);
        const response = await fetcher(finalParams, fetchConfig);
        setData(response);
        return response;
      } catch (caughtError) {
        setError(caughtError);
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [params, fetcher, fetchConfig]
  );

  /** Render the processing hook if it exists */
  const validationErrors =
    useApProcessing?.({
      data: data as UnwrapAxiosResponse<unknown>,
      mode,
      isLoading,
      endpointId,
      params: stateParams,
      error,
    }) ?? [];

  return { validationErrors, clientFetch, data, error, isLoading };
};
