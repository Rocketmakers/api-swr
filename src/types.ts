/*
 * Types
 * --------------------------------------
 * All TypeScript only types and interfaces
 */
import type { AxiosRequestConfig } from 'axios';
import type { Arguments, SWRConfiguration, SWRResponse } from 'swr';

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
 * The validation message
 * Can be a string or an element
 */
export type ValidationMessage = string | JSX.Element;

/**
 * An individual validation error.
 */
export interface IValidationError {
  /**
   * The attribute of the form data to apply the error to.
   * - Should represent a string path to a nested property, or a string key to a root property.
   * - Two formats are accepted:
   * @example `rootObject.subObject.subArray.3.field`
   * @example `rootObject.subObject.subArray[3].field`
   */
  key: string;
  /**
   * The error message
   */
  message: ValidationMessage;
  /**
   * Identifier (optional)
   * - Can be used when dispatching validation errors client side so that they can be grouped and cleared in groups.
   */
  identifier?: string;
}

/**
 * Root type for a global API Processing hook
 * - This hook is rendered by every query and mutation that runs through api-swr
 * - It receives a bunch of useful params about the request, and is responsible primarily for client-side error handling
 */
export type APIProcessingHook = (params: IProcessingHookParams) => Array<IValidationError>;

/**
 * Represents the configuration of an open API controller.
 */
export interface IOpenApiControllerSetup<TConfiguration> {
  /** Optional base path for all API calls */
  basePath?: string;
  /** Optional fetch config to pass to all API calls (type exported from the OpenAPI client) */
  fetchConfig?: TConfiguration;
  /** Additional config to send to SWR for all queries */
  swrConfig?: SWRConfiguration<UnwrapAxiosResponse<any> | undefined>;
  /** Optional boolean to turn on mocked endpoints */
  enableMocking?: boolean;
  /** Optional processing hook for all client side fetches */
  useApiProcessing?: APIProcessingHook;
}

/**
 * Represents a type that extends the functionality of `ControllerHooks` by adding a method `registerMockEndpoints`.
 */
type ControllerReturn<TClass extends BaseAPI> = ControllerHooks<InstanceType<TClass>, AxiosRequestConfig> & {
  registerMockEndpoints: (mockEndpoints: Partial<MockEndpoints<InstanceType<TClass>, AxiosRequestConfig>>) => void;
};

/**
 * Represents the controller creation functions returned by the controller factory
 */
export interface IApiControllerFactory {
  /** Creates a set of state management tools from an OpenAPI controller */
  createAxiosOpenApiController: <TClass extends BaseAPI>(controllerKey: string, OpenApiClass: TClass) => ControllerReturn<TClass>;
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

/**
 * Represents the configuration options for the useQuery react hook.
 */
export interface IUseQueryConfig<TFunc extends AnyPromiseFunction, TConfig> {
  /** The cache key to store the response against, it can be a string param key, an array of param keys, or a function that generates the key from params. */
  cacheKey?: CacheKey<Partial<FirstArg<TFunc>>>;
  /** The params for the API call (usually a combination route params, query string params & body) */
  params?: Partial<FirstArg<TFunc>>;
  /** The config for the API call (specific to the fetcher, but usually non-param fetch properties like headers etc.) */
  fetchConfig?: TConfig;
  /** Additional config to send to SWR (like settings or fallback data for SSR) */
  swrConfig?: SWRConfiguration<UnwrapAxiosResponse<TFunc> | undefined>;
}

/**
 * Represents the configuration options for the useMutation react hook.
 */
export interface IUseMutationConfig<TFunc extends AnyPromiseFunction, TConfig> {
  /** The params for the API call (usually a combination route params, query string params & body) */
  params?: Partial<FirstArg<TFunc>>;
  /** The config for the API call (specific to the fetcher, but usually non-param fetch properties like headers etc.) */
  fetchConfig?: TConfig;
}

/**
 * Represents the response from the `useMutation` react hook.
 */
export interface IUseMutationResponse<TFunc extends AnyPromiseFunction> {
  /**
   * The async function which performs the mutation.
   * @param execParams - The params for the request as a typed param object.
   * @returns A promise containing the unwrapped response data from the mutation
   */
  clientFetch: (execParams?: Partial<FirstArg<TFunc>>) => Promise<UnwrapAxiosResponse<TFunc> | undefined>;
  /** Any validation errors returned by the global API processing hook */
  validationErrors: Array<IValidationError>;
  /** Whether the request is currently pending or not */
  isLoading: boolean;
  /** The request response data if any */
  data?: UnwrapAxiosResponse<TFunc>;
  /** The request response error if any */
  error?: unknown;
}

/**
 * The tools returned from a controller factory for each endpoint, so be used in endpoint hooks
 */
export interface EndpointDefinition<TFunc extends AnyPromiseFunction, TConfig> {
  /** The string name given to the controller - used as the first part of the cache key for data separation */
  controllerKey: string;
  /** The string name of the endpoint (derived from the controller object) - used as the second part of the cache key for data separation */
  endpointKey: string;
  /** The `controller.endpoint` format endpoint ID of the request */
  endpointId: string;
  /** The fetch method for actually requesting the data from the API */
  fetch: (params?: FirstArg<TFunc>, config?: TConfig) => Promise<UnwrapAxiosResponse<TFunc>>;
  /** Returns the cacheKey specific to the controller/endpoint with an optional addition, in the format: `controllerKey.endpointKey.additionalCacheKey` */
  cacheKey: (additionalCacheKey?: string) => string;
  /** Returns a `swr` mutate matcher function which will invalidate on the basis of "starts with" on the root cache key */
  startsWithInvalidator: (additionalCacheKey?: string) => (key?: Arguments) => boolean;
  /** A hook for performing GET queries - wrapped version of the `useSwr` hook returned from the SWR library, see here: https://swr.vercel.app */
  useQuery: (config?: IUseQueryConfig<TFunc, TConfig>) => SWRResponse<UnwrapAxiosResponse<TFunc>>;
  /** A hook for performing POST/PATCH/PUT/DELETE mutations - interfaces with global processing. */
  useMutation: (config?: IUseMutationConfig<TFunc, TConfig>) => IUseMutationResponse<TFunc>;
}

/**
 * Represents a dictionary of tools for an API controller, keyed by the endpoints in the controller
 */
export type ControllerHooks<TApiController, TConfig> = {
  [TEndpointKey in keyof TApiController]: TApiController[TEndpointKey] extends AnyPromiseFunction
    ? EndpointDefinition<TApiController[TEndpointKey], TConfig>
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
