/*
 * Types
 * --------------------------------------
 * All TypeScript only types and interfaces
 */
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { SWRConfiguration } from 'swr';
import type { SWRInfiniteConfiguration } from 'swr/infinite';
import type { APIProcessingHook, AnyPromiseFunction, EndpointDefinition, GlobalFetchWrapperHook, MockEndpoints } from './global';

/**
 * Represents any class
 */
export type BaseAPI = new (...args: any) => any;

/**
 * Represents the configuration of an open API controller.
 */
export interface IOpenApiControllerSetup<TConfig, TProcessingResponse> {
  /** Optional base path for all API calls */
  basePath?: string;
  /** Optional config to pass to the API constructor (type exported from the OpenAPI client) */
  openApiConfig?: TConfig;
  /** Additional config to send to SWR for all queries */
  swrConfig?: SWRConfiguration<any | undefined>;
  /** Additional config to send to SWR for all infinite loader queries */
  swrInfiniteConfig?: SWRInfiniteConfiguration<any | undefined>;
  /** Optional boolean to turn on mocked endpoints */
  enableMocking?: boolean;
  /** Optional processing hook for all client side fetches */
  useApiProcessing?: APIProcessingHook<TProcessingResponse, any>;
  /** Optional wrapper for all client side fetches */
  useGlobalFetchWrapper?: GlobalFetchWrapperHook<
    AxiosRequestConfig,
    (params: object, config: AxiosRequestConfig | undefined) => Promise<AxiosResponse<any>>,
    AxiosResponse<any>
  >;
}

/**
 * Represents a dictionary of tools for an API controller, keyed by the endpoints in the controller
 */
export type AxiosOpenApiControllerHooks<TApiController, TProcessingResponse> = {
  [TEndpointKey in keyof TApiController]: TApiController[TEndpointKey] extends AnyPromiseFunction
    ? EndpointDefinition<
        TApiController[TEndpointKey],
        AxiosRequestConfig,
        TProcessingResponse,
        Awaited<ReturnType<TApiController[TEndpointKey]>>,
        UnwrapAxiosResponse<TApiController[TEndpointKey]>
      >
    : never;
};

/**
 * Represents a type that extends the functionality of `AxiosOpenApiControllerHooks` by adding a method `registerMockEndpoints`.
 */
type AxiosOpenApiControllerReturn<TClass extends BaseAPI, TProcessingResponse> = AxiosOpenApiControllerHooks<
  InstanceType<TClass>,
  TProcessingResponse
> & {
  registerMockEndpoints: (mockEndpoints: Partial<MockEndpoints<InstanceType<TClass>, AxiosRequestConfig>>) => void;
};

/**
 * Represents the controller creation functions returned by the controller factory
 */
export interface IAxiosOpenApiControllerFactory<TProcessingResponse> {
  /** Creates a set of state management tools from an OpenAPI controller */
  createAxiosOpenApiController: <TClass extends BaseAPI>(
    controllerKey: string,
    OpenApiClass: TClass
  ) => AxiosOpenApiControllerReturn<TClass, TProcessingResponse>;
}

/**
 * Extracts the response type from an axios request function.
 */
export type UnwrapAxiosResponse<TFunc> = TFunc extends (...args: Array<any>) => Promise<{ data: infer TResponse; status: number }>
  ? TResponse
  : TFunc extends (...args: Array<any>) => Promise<infer P>
    ? P
    : never;
