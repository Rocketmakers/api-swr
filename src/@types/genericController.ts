import type { SWRConfiguration } from 'swr';
import type { SWRInfiniteConfiguration } from 'swr/infinite';
import { APIProcessingHook, AnyPromiseFunction, EndpointDefinition, GlobalFetchWrapperHook, MockEndpoints } from './global';

/**
 * Represents a generic fetch function
 */
export type GenericControllerFetch<TConfig extends object> = (params: object, config: TConfig | undefined) => Promise<unknown>;

/**
 * Represents a generic controller with fetch functions for each endpoint
 */
export type GenericController<TConfig extends object> = Record<string, GenericControllerFetch<TConfig>>;

/**
 * Represents the configuration of an open API controller.
 */
export interface IGenericControllerSetup<TConfig extends object, TProcessingResponse> {
  /** Optional custom fetch config to pass to all API calls. Can be overridden at endpoint and fetch level */
  globalFetchConfig?: TConfig;
  /** Additional config to send to SWR for all queries */
  swrConfig?: SWRConfiguration<any | undefined>;
  /** Additional config to send to SWR for all infinite loader queries */
  swrInfiniteConfig?: SWRInfiniteConfiguration<any | undefined>;
  /** Optional boolean to turn on mocked endpoints */
  enableMocking?: boolean;
  /** Optional processing hook for all client side fetches */
  useApiProcessing?: APIProcessingHook<TProcessingResponse, any>;
  /** Optional wrapper for all client side fetches */
  useGlobalFetchWrapper?: GlobalFetchWrapperHook<TConfig, GenericControllerFetch<TConfig>, unknown>;
}

/**
 * Represents a dictionary of tools for a generic API controller, keyed by the endpoints in the controller
 */
export type GenericApiControllerHooks<TApiController, TConfig extends object, TProcessingResponse> = {
  [TEndpointKey in keyof TApiController]: TApiController[TEndpointKey] extends AnyPromiseFunction
    ? EndpointDefinition<TApiController[TEndpointKey], TConfig, TProcessingResponse, TApiController[TEndpointKey]>
    : never;
};

/**
 * Represents a type that extends the functionality of `ControllerHooks` by adding a method `registerMockEndpoints`.
 */
type GenericApiControllerReturn<
  TConfig extends object,
  TController extends GenericController<TConfig>,
  TProcessingResponse,
> = GenericApiControllerHooks<TController, TConfig, TProcessingResponse> & {
  registerMockEndpoints: (mockEndpoints: Partial<MockEndpoints<TController, TConfig>>) => void;
};

/**
 * Represents the controller creation functions returned by the controller factory
 */
export interface IGenericApiControllerFactory<TConfig extends object, TProcessingResponse> {
  /** Creates a set of state management tools from an OpenAPI controller */
  createGenericApiController: <TController extends GenericController<TConfig>>(
    controllerKey: string,
    controllerObject: TController
  ) => GenericApiControllerReturn<TConfig, TController, TProcessingResponse>;
}
