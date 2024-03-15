/*
 * Factory function for linking OpenAPI to SWR
 * --------------------------------------
 * Creates a type safe wrapper around an OpenAPI client
 */
import type { AxiosRequestConfig } from 'axios';
import { Arguments } from 'swr';

import { useClientFetch } from '../hooks/useClientFetch';
import { useQuery } from '../hooks/useQuery';
import type {
  AnyPromiseFunction,
  BaseAPI,
  CacheKeyAdditionalValue,
  ControllerHooks,
  EndpointDefinition,
  IApiControllerFactory,
  IOpenApiControllerSetup,
  MockEndpoints,
} from '../types';
import { fixGeneratedClient, unwrapAxiosPromise } from '../utils/api';
import { cacheKeyConcat } from '../utils/caching';
import { useInfiniteQuery } from '../hooks/useInfiniteQuery';

/**
 * Creates a factory of state management tools from an OpenAPI controller using Axios.
 *
 * @param {IAxiosOpenApiControllerSetup} options - An object containing options for the factory.
 * @param {string} options.basePath - The base URL path for the OpenAPI controller.
 * @param {Configuration} options.openApiConfig - The configuration object for OpenAPI HTTP requests.
 * @param {boolean} options.enableMocking - Will use mock endpoint definitions instead of calling out to the real API.
 * @param {APIProcessingHook} options.useApiProcessing - Optional processing hook for all client side fetches.
 * @param {GlobalFetchWrapperHook<TConfig>} options.useGlobalFetchWrapper - Optional fetch wrapper hook for all client side fetches.
 * @param {SWRConfiguration<UnwrapAxiosResponse<any> | undefined>} options.swrConfig - Additional config to send to SWR for all queries.
 * @param {SWRInfiniteConfiguration<UnwrapAxiosResponse<any> | undefined>} options.swrInfiniteConfig - Additional config to send to SWR for all infinite loader queries.
 * @returns {IApiControllerFactory} A library of controller factory methods that create state management tools for an OpenAPI controller.
 */
export const axiosOpenApiControllerFactory = <TConfig, TProcessingResponse>({
  basePath,
  openApiConfig,
  enableMocking,
  useApiProcessing,
  useGlobalFetchWrapper,
  swrConfig,
  swrInfiniteConfig,
}: IOpenApiControllerSetup<TConfig, TProcessingResponse>): IApiControllerFactory<TProcessingResponse> => {
  /**
   * Creates a set of state management tools from an OpenAPI controller
   *
   * @param controllerKey A name to use as the first part of the cache key for this controller, must be unique amongst all controllers
   * @param OpenApiClass The OpenAPI controller class
   * @param openApiConfigOverride The configuration object for OpenAPI HTTP requests, will override the default configuration at API factory level
   * @returns A set of state management tools for an OpenAPI controller using Axios
   */
  const createAxiosOpenApiController = <TClass extends BaseAPI>(controllerKey: string, OpenApiClass: TClass, openApiConfigOverride?: TConfig) => {
    // fix scoping issues in generated client
    const client = fixGeneratedClient(new OpenApiClass(openApiConfigOverride ?? openApiConfig, basePath) as InstanceType<TClass>);

    // Record of mock endpoints
    let registeredMockEndpoints: Partial<MockEndpoints<InstanceType<TClass>, AxiosRequestConfig>> = {};

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

    // iterate the OpenAPI class
    const endpoints = Object.keys(client).reduce<ControllerHooks<InstanceType<TClass>, AxiosRequestConfig, TProcessingResponse>>(
      (memo, endpointKey) => {
        /**
         * Fetch function for server/client side use, calls the OpenAPI fetcher and unwraps the axios response
         * @param args Whatever args have been passed to the fetch, this function doesn't need to know what they are
         * @returns The unwrapped axios response data
         */
        const fetch = async (...args: Array<unknown>) => {
          if (enableMocking) {
            const mockFunc = getMockEndpointFunction(endpointKey);
            return unwrapAxiosPromise(() => mockFunc(...args));
          }
          const func = (client as Record<string, AnyPromiseFunction>)[endpointKey];
          return unwrapAxiosPromise(() => func(...args));
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
        const endpointTools: EndpointDefinition<AnyPromiseFunction, AxiosRequestConfig, TProcessingResponse> = {
          controllerKey,
          endpointKey,
          endpointId: cacheKeyConcat(controllerKey, endpointKey),
          fetch,
          cacheKey: cacheKeyGetter,
          startsWithInvalidator,
          useQuery: (config) => useQuery(endpointId, fetch, config, useApiProcessing, useGlobalFetchWrapper, swrConfig),
          useMutation: (config) =>
            useClientFetch(
              endpointId,
              'mutation',
              config?.fetchConfig,
              fetch,
              config?.params,
              useApiProcessing,
              useGlobalFetchWrapper,
              config?.fetchWrapper
            ),
          useInfiniteQuery: (config) => useInfiniteQuery(endpointId, fetch, config, useApiProcessing, useGlobalFetchWrapper, swrInfiniteConfig),
        };

        return { ...memo, [endpointKey]: endpointTools };
      },
      {} as ControllerHooks<InstanceType<TClass>, AxiosRequestConfig, TProcessingResponse>
    );

    return { ...endpoints, registerMockEndpoints };
  };

  return { createAxiosOpenApiController };
};
