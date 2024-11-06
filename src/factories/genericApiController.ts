/*
 * Factory function for linking OpenAPI to SWR
 * --------------------------------------
 * Creates a type safe wrapper around an OpenAPI client
 */
import { Arguments } from 'swr';

import { useClientFetch } from '../hooks/useClientFetch';
import { useQuery } from '../hooks/useQuery';
import { cacheKeyConcat } from '../utils/caching';
import { useInfiniteQuery } from '../hooks/useInfiniteQuery';
import { GenericApiControllerHooks, GenericController, IGenericApiControllerFactory, IGenericControllerSetup } from '../@types/genericController';
import { AnyPromiseFunction, CacheKeyAdditionalValue, EndpointDefinition, MockEndpoints } from '../@types/global';
import { combineConfigs } from '../utils/config';

/**
 * Creates a factory of state management tools from a generic API controller object.
 *
 * @param {TConfig} globalFetchConfig - Optional custom fetch config to pass to all API calls. Can be overridden at endpoint and fetch level.
 * @param {boolean} options.enableMocking - Will use mock endpoint definitions instead of calling out to the real API.
 * @param {APIProcessingHook} options.useApiProcessing - Optional processing hook for all client side fetches.
 * @param {GlobalFetchWrapperHook<TConfig>} options.useGlobalFetchWrapper - Optional fetch wrapper hook for all client side fetches.
 * @param {SWRConfiguration<any | undefined>} options.swrConfig - Additional config to send to SWR for all queries.
 * @param {SWRInfiniteConfiguration<any | undefined>} options.swrInfiniteConfig - Additional config to send to SWR for all infinite loader queries.
 * @returns {IApiControllerFactory} A library of controller factory methods that create state management tools for a generic controller.
 */
export const genericApiControllerFactory = <TConfig extends object | undefined, TProcessingResponse>({
  globalFetchConfig,
  enableMocking,
  useApiProcessing,
  useGlobalFetchWrapper,
  swrConfig,
  swrInfiniteConfig,
}: IGenericControllerSetup<TConfig, TProcessingResponse> = {}): IGenericApiControllerFactory<TConfig, TProcessingResponse> => {
  /**
   * Creates a set of state management tools from an OpenAPI controller
   *
   * @param controllerKey A name to use as the first part of the cache key for this controller, must be unique amongst all controllers
   * @param controller The controller object
   * @param controllerConfig Optional custom fetch config to pass to all API calls. Inherits global config and can be overridden at fetch level.
   * @returns A set of state management tools for an OpenAPI controller using Axios
   */
  const createGenericApiController = <TController extends GenericController<TConfig>>(
    controllerKey: string,
    controller: TController,
    controllerConfig?: TConfig
  ) => {
    // Record of mock endpoints
    let registeredMockEndpoints: Partial<MockEndpoints<TController, TConfig>> = {};

    /**
     * Merges the provided mock endpoints with the already registered mock endpoints.
     * @param mockEndpoints - An object containing mock endpoint functions.
     */
    const registerMockEndpoints = (mockEndpoints: typeof registeredMockEndpoints) => {
      registeredMockEndpoints = { ...registeredMockEndpoints, ...mockEndpoints };
    };

    /**
     * Retrieves a mock endpoint function for a given endpoint key.
     * @param endpointKey - The key of the endpoint to retrieve the mock function for.
     * @returns The mock function for the given endpoint key.
     * @throws Will throw an error if a mock function for the given endpoint key has not been registered.
     */
    const getMockEndpointFunction = (endpointKey: string) => {
      const mockFunc = (registeredMockEndpoints as Record<string, AnyPromiseFunction>)[endpointKey];

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- this is nonsense, it's always defined
      if (!mockFunc) {
        throw new Error(`Mock endpoint not defined for: ${controllerKey}.${endpointKey}`);
      }
      return mockFunc;
    };

    // iterate the controller object
    const endpoints = Object.keys(controller).reduce<GenericApiControllerHooks<TController, TConfig, TProcessingResponse>>(
      (memo, endpointKey) => {
        /**
         * Fetch function for server/client side use, calls the fetcher
         * @param args Whatever args have been passed to the fetch, this function doesn't need to know what they are
         * @returns The response data
         */
        const fetch = async (...args: Array<unknown>) => {
          if (enableMocking) {
            const mockFunc = getMockEndpointFunction(endpointKey);
            return mockFunc(...args);
          }
          const func = (controller as Record<string, AnyPromiseFunction>)[endpointKey];
          return func(...args);
        };

        /**
         * Retrieves the cache key for this specific endpoint
         * @param additionalCacheKey Any further cache key parts to add on to the default `controllerKey.endpointKey`
         * @returns The final cache key string for the endpoint
         */
        const cacheKeyGetter = (additionalCacheKey?: CacheKeyAdditionalValue) => {
          let finalKeys = Array.isArray(additionalCacheKey) ? additionalCacheKey : [additionalCacheKey];
          finalKeys = finalKeys.filter((key) => key !== undefined && key !== null);
          return cacheKeyConcat(controllerKey, endpointKey, ...finalKeys);
        };

        /**
         * Returns a `swr` mutate matcher function which will invalidate on the basis of "starts with" on the root cache key
         * @param additionalCacheKey Any further cache key parts to add on to the default `controllerKey.endpointKey`
         * @returns A `swr` mutate matcher function
         */
        const startsWithInvalidator = (additionalCacheKey?: CacheKeyAdditionalValue) => {
          return (key: Arguments) => {
            return typeof key === 'string' && key.startsWith(cacheKeyGetter(additionalCacheKey));
          };
        };

        const endpointId = cacheKeyGetter();

        /**
         * The combined state management tools for this endpoint
         */
        const endpointTools: EndpointDefinition<AnyPromiseFunction, TConfig, TProcessingResponse> = {
          controllerKey,
          endpointKey,
          endpointId: cacheKeyConcat(controllerKey, endpointKey),
          fetch: (params, config) => fetch(params, combineConfigs({ fetchConfig: config }, globalFetchConfig, controllerConfig)?.fetchConfig),
          cacheKey: cacheKeyGetter,
          startsWithInvalidator,
          useQuery: (config) =>
            useQuery<AnyPromiseFunction, TConfig, TProcessingResponse>(
              endpointId,
              fetch,
              combineConfigs(config, globalFetchConfig, controllerConfig),
              useApiProcessing,
              useGlobalFetchWrapper,
              swrConfig
            ),
          useMutation: (config) =>
            useClientFetch<AnyPromiseFunction, TConfig, TProcessingResponse>(
              endpointId,
              'mutation',
              combineConfigs(config, globalFetchConfig, controllerConfig)?.fetchConfig,
              fetch,
              config?.params,
              useApiProcessing,
              useGlobalFetchWrapper,
              config?.fetchWrapper
            ),
          useInfiniteQuery: (config) =>
            useInfiniteQuery<AnyPromiseFunction, TConfig, TProcessingResponse>(
              endpointId,
              fetch,
              combineConfigs(config, globalFetchConfig, controllerConfig),
              useApiProcessing,
              useGlobalFetchWrapper,
              swrInfiniteConfig
            ),
        };

        return { ...memo, [endpointKey]: endpointTools };
      },
      {} as GenericApiControllerHooks<TController, TConfig, TProcessingResponse>
    );

    return { ...endpoints, registerMockEndpoints };
  };

  return { createGenericApiController };
};
