import { BaseAPI, EndpointIds } from '../types';
import { fixGeneratedClient } from '../utils/api';
import { cacheKeyConcat } from '../utils/caching';

/**
 * Creates a dictionary of endpoint IDs generated from a passed in API client class.
 * - Allows us to identify endpoints in a type safe way
 * @param controllerKey A name to use as the first part of the cache key for this controller, must be unique amongst all controllers
 * @param OpenApiClass The OpenAPI controller class
 * @returns A dictionary of endpoint IDs generated from a passed in API client class + the passed in controller key
 */
export const endpointIdFactory = <TClass extends BaseAPI>(controllerKey: string, OpenApiClass: TClass): EndpointIds<InstanceType<TClass>> => {
  // fix scoping issues in generated client
  const client = fixGeneratedClient(new OpenApiClass());

  return {
    ...Object.keys(client).reduce((memo, endpointKey) => {
      return {
        ...memo,
        [endpointKey]: {
          endpointId: (additionalCacheKey?: string) => cacheKeyConcat(controllerKey, endpointKey, additionalCacheKey),
        },
      };
    }, {}),
    controllerKey,
  } as EndpointIds<InstanceType<TClass>>;
};
