/*
 * Types
 * --------------------------------------
 * All TypeScript only types and interfaces
 */
import type { AxiosRequestConfig } from 'axios';
import type { Arguments, SWRConfiguration, SWRResponse } from 'swr';
import type { SWRInfiniteConfiguration, SWRInfiniteResponse } from 'swr/infinite';

/**
 * Represents any class
 */
export type BaseAPI = new (...args: any) => any;

/**
 * Represents any function that returns a promise
 */
export type AnyPromiseFunction = (...params: Array<any>) => Promise<any>;

/**
 * Extracts the type of the first parameter from a given function type.
 */
export type FirstArg<TFunc> = TFunc extends (x: infer A, ...args: Array<any>) => any ? A : never;

/**
 * Hook request mode for use in API Processing, informs whether the request originated from a query or mutation
 */
export type HookRequestMode = 'mutation' | 'query';

/**
 * Type denoting the params passed to the global API Processing hook.
 */
export interface IFetchWrapperParams<TFunc extends AnyPromiseFunction, TConfig extends object> {
  /** The `controller.endpoint` format endpoint ID of the request */
  endpointId: string;
  /** A reference to the root fetch function use by swr to request the data  */
  rootFetcher: TFunc;
  /** The params for the API call (usually a combination route params, query string params & body) */
  params: Partial<FirstArg<TFunc>>;
  /** The hook mode (either `query` or `mutation`) */
  mode: HookRequestMode;
  /** The config for the API call (specific to the fetcher, but usually non-param fetch properties like headers etc.) */
  config?: TConfig;
}

/**
 * Represents a wrapper around the raw fetch function for adding extra processing to a fetch request
 */
export type FetchWrapper<TFunc extends AnyPromiseFunction, TConfig extends object> = (
  params: IFetchWrapperParams<TFunc, TConfig>
) => Promise<UnwrapAxiosResponse<TFunc>>;

/**
 * Root type for a global API Fetch wrapper
 * - The function returned by this hook is used by all queries and mutations that run through api-swr.
 * - WARNING: This hook is called on every request, so it should be memoized to avoid unnecessary re-renders.
 * - FURTHER WARNING: The function returned by this hook must call the incoming `rootFetcher` function with the supplied params and config, otherwise the request will not be made.
 */
export type GlobalFetchWrapperHook<TConfig extends object> = () => FetchWrapper<
  (params: object, config: TConfig | undefined) => Promise<unknown>,
  TConfig
>;

/**
 * Type denoting the params passed to the global API Processing hook.
 */
export interface IProcessingHookParams {
  /** The `controller.endpoint` format endpoint ID of the request */
  endpointId: string;
  /** The request response data if any */
  data?: UnwrapAxiosResponse<unknown>;
  /** The request response error if any */
  error?: unknown;
  /** The params sent to the request */
  params?: unknown;
  /** Whether the request is currently pending or not */
  isLoading: boolean;
  /** Informs whether the request originated from a query or mutation */
  mode: HookRequestMode;
}

/**
 * Root type for a global API Processing hook
 * - This hook is rendered by every query and mutation that runs through api-swr
 * - It receives a bunch of useful params about the request, and is responsible primarily for client-side error handling
 */
export type APIProcessingHook<TProcessingResponse> = (params: IProcessingHookParams) => TProcessingResponse;

/**
 * Represents the configuration of an open API controller.
 */
export interface IOpenApiControllerSetup<TConfig, TProcessingResponse> {
  /** Optional base path for all API calls */
  basePath?: string;
  /** Optional fetch config to pass to all API calls (type exported from the OpenAPI client) */
  openApiConfig?: TConfig;
  /** Additional config to send to SWR for all queries */
  swrConfig?: SWRConfiguration<UnwrapAxiosResponse<any> | undefined>;
  /** Additional config to send to SWR for all infinite loader queries */
  swrInfiniteConfig?: SWRInfiniteConfiguration<UnwrapAxiosResponse<any> | undefined>;
  /** Optional boolean to turn on mocked endpoints */
  enableMocking?: boolean;
  /** Optional processing hook for all client side fetches */
  useApiProcessing?: APIProcessingHook<TProcessingResponse>;
  /** Optional wrapper for all client side fetches */
  useGlobalFetchWrapper?: GlobalFetchWrapperHook<AxiosRequestConfig>;
}

/**
 * Represents a type that extends the functionality of `ControllerHooks` by adding a method `registerMockEndpoints`.
 */
export type ControllerReturn<TClass extends BaseAPI, TProcessingResponse> = ControllerHooks<
  InstanceType<TClass>,
  AxiosRequestConfig,
  TProcessingResponse
> & {
  registerMockEndpoints: (mockEndpoints: Partial<MockEndpoints<InstanceType<TClass>, AxiosRequestConfig>>) => void;
};

/**
 * Represents the controller creation functions returned by the controller factory
 */
export interface IApiControllerFactory<TProcessingResponse> {
  /** Creates a set of state management tools from an OpenAPI controller */
  createAxiosOpenApiController: <TClass extends BaseAPI>(
    controllerKey: string,
    OpenApiClass: TClass
  ) => ControllerReturn<TClass, TProcessingResponse>;
}

/**
 * Extracts the response type from an axios request function.
 */
export type UnwrapAxiosResponse<TFunc> = TFunc extends (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: Array<any>
) => Promise<{ data: infer TResponse; status: number }>
  ? TResponse
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TFunc extends (...args: Array<any>) => Promise<infer P>
    ? P
    : never;

/**
 * Represents the cache key for an API endpoint. It can be a string param key, an array of param keys, or a function that generates the key from params.
 */
export type CacheKey<TArgs> = keyof TArgs | Array<keyof TArgs> | ((params?: TArgs) => string);

export interface IHookBaseConfig<TFunc extends AnyPromiseFunction, TConfig extends object> {
  /** The params for the API call (usually a combination route params, query string params & body) */
  params?: Partial<FirstArg<TFunc>>;
  /** The config for the API call (specific to the fetcher, but usually non-param fetch properties like headers etc.) */
  fetchConfig?: TConfig;
  /**
   * An optional fetch wrapper for this specific hook.
   * NOTE: This will be called in place of any supplied global fetch wrapper for maximum flexibility. If you want to use the global fetch wrapper, you must call it manually within the wrapper passed here.
   * */
  fetchWrapper?: FetchWrapper<TFunc, TConfig>;
}

/**
 * Represents the configuration options for the useQuery react hook.
 */
export interface IUseQueryConfig<TFunc extends AnyPromiseFunction, TConfig extends object> extends IHookBaseConfig<TFunc, TConfig> {
  /** The cache key to store the response against, it can be a string param key, an array of param keys, or a function that generates the key from params. */
  cacheKey?: CacheKey<Partial<FirstArg<TFunc>>>;
  /** Additional config to send to SWR (like settings or fallback data for SSR) */
  swrConfig?: SWRConfiguration<UnwrapAxiosResponse<TFunc> | undefined>;
  /** If this property is false, the query fetch will wait until it becomes true or undefined. Useful for holding back queries until conditions are met */
  waitFor?: boolean;
}

export interface IUseQueryInfiniteConfig<TFunc extends AnyPromiseFunction, TConfig extends object>
  extends Omit<IUseQueryConfig<TFunc, TConfig>, 'swrConfig' | 'params'> {
  /** Additional config to send to SWR (like settings or fallback data for SSR) */
  swrConfig?: SWRInfiniteConfiguration<UnwrapAxiosResponse<TFunc> | undefined>;
  /** The params for the API call (usually a combination route params, query string params & body). Must be supplied as a function which is passed the index of the current page */
  params?: (index: number, prevData?: UnwrapAxiosResponse<TFunc> | undefined) => Partial<FirstArg<TFunc>>;
}

/**
 * Represents the configuration options for the useMutation react hook.
 */
export type IUseMutationConfig<TFunc extends AnyPromiseFunction, TConfig extends object> = IHookBaseConfig<TFunc, TConfig>;

export interface IWithProcessingResponse<TProcessingResponse> {
  /** The response returned by the global API processing hook */
  processingResponse?: TProcessingResponse;
}

/**
 * Represents the response from the `useQuery` react hook.
 */
export type IUseQueryResponse<TFunc extends AnyPromiseFunction, TProcessingResponse> = SWRResponse<UnwrapAxiosResponse<TFunc> | undefined> &
  IWithProcessingResponse<TProcessingResponse>;

/**
 * Represents the response from the `useInfiniteQuery` react hook.
 */
export type IUseInfiniteQueryResponse<TFunc extends AnyPromiseFunction, TProcessingResponse> = SWRInfiniteResponse<
  UnwrapAxiosResponse<TFunc> | undefined
> &
  IWithProcessingResponse<TProcessingResponse>;

/**
 * Represents the response from the `useMutation` react hook.
 */
export interface IUseMutationResponse<TFunc extends AnyPromiseFunction, TProcessingResponse> extends IWithProcessingResponse<TProcessingResponse> {
  /**
   * The async function which performs the mutation.
   * @param execParams - The params for the request as a typed param object.
   * @returns A promise containing the unwrapped response data from the mutation
   */
  clientFetch: (execParams?: Partial<FirstArg<TFunc>>) => Promise<UnwrapAxiosResponse<TFunc> | undefined>;
  /** Whether the request is currently pending or not */
  isLoading: boolean;
  /** The request response data if any */
  data?: UnwrapAxiosResponse<TFunc>;
  /** The request response error if any */
  error?: unknown;
}

/**
 * Represents the additional cache key argument that can be added to a `cacheKey` getter function.
 */
export type CacheKeyAdditionalValue = string | Array<string>;

/**
 * The tools returned from a controller factory for each endpoint, so be used in endpoint hooks
 */
export interface EndpointDefinition<TFunc extends AnyPromiseFunction, TConfig extends object, TProcessingResponse> {
  /** The string name given to the controller - used as the first part of the cache key for data separation */
  controllerKey: string;
  /** The string name of the endpoint (derived from the controller object) - used as the second part of the cache key for data separation */
  endpointKey: string;
  /** The `controller.endpoint` format endpoint ID of the request */
  endpointId: string;
  /** The fetch method for actually requesting the data from the API */
  fetch: (params?: FirstArg<TFunc>, config?: TConfig) => Promise<UnwrapAxiosResponse<TFunc>>;
  /** Returns the cacheKey specific to the controller/endpoint with an optional addition, in the format: `controllerKey.endpointKey.additionalCacheKey` */
  cacheKey: (additionalCacheKey?: CacheKeyAdditionalValue) => string;
  /** Returns a `swr` mutate matcher function which will invalidate on the basis of "starts with" on the root cache key */
  startsWithInvalidator: (additionalCacheKey?: CacheKeyAdditionalValue) => (key?: Arguments) => boolean;
  /** A hook for performing GET queries - wrapped version of the `useSwr` hook returned from the SWR library, see here: https://swr.vercel.app */
  useQuery: (config?: IUseQueryConfig<TFunc, TConfig>) => IUseQueryResponse<TFunc, TProcessingResponse>;
  /** A hook for performing infinite loader GET queries - wrapped version of the `useInfiniteSwr` hook returned from the SWR library, see here: https://swr.vercel.app */
  useInfiniteQuery: (config?: IUseQueryInfiniteConfig<TFunc, TConfig>) => IUseInfiniteQueryResponse<TFunc, TProcessingResponse>;
  /** A hook for performing POST/PATCH/PUT/DELETE mutations - interfaces with global processing. */
  useMutation: (config?: IUseMutationConfig<TFunc, TConfig>) => IUseMutationResponse<TFunc, TProcessingResponse>;
}

/**
 * Represents a dictionary of tools for an API controller, keyed by the endpoints in the controller
 */
export type ControllerHooks<TApiController, TConfig extends object, TProcessingResponse> = {
  [TEndpointKey in keyof TApiController]: TApiController[TEndpointKey] extends AnyPromiseFunction
    ? EndpointDefinition<TApiController[TEndpointKey], TConfig, TProcessingResponse>
    : never;
};

/**
 * Represents a dictionary of endpoint IDs for an API controller, keyed by the endpoints in the controller + an export of the root controllerKey
 */
export type EndpointIds<TApiController> = {
  [TEndpointKey in keyof TApiController]: {
    /** Returns the endpointId specific to the controller/endpoint with an optional addition, in the format: `controllerKey.endpointKey.additionalCacheKey` */
    endpointId: (additionalCacheKey?: string) => string;
  };
} & {
  /** The string name given to the controller - used as the first part of the cache key for data separation */
  controllerKey: string;
};

/**
 * Represents a dictionary of mock functions for an API controller, keyed by the endpoints in the controller
 */
export type MockEndpoints<TApiController, TConfig> = {
  [TEndpointKey in keyof TApiController]: TApiController[TEndpointKey] extends AnyPromiseFunction
    ? (params?: FirstArg<TApiController[TEndpointKey]>, config?: TConfig) => ReturnType<TApiController[TEndpointKey]>
    : never;
};
