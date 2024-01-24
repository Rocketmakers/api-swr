import type { AxiosResponse } from 'axios';

import type { IOpenApiControllerSetup } from '../types';
import { fixGeneratedClient } from '../utils/api';
import { cacheKeyConcat } from '../utils/caching';
import { createMockAxiosSuccessResponse } from '../utils/mocking';

import { axiosOpenApiControllerFactory } from './axiosOpenApiController';

/** mock OpenAPI controller */
class MockApi {
  testGetSuccess(): Promise<AxiosResponse<{ test: string }>> {
    return Promise.resolve({
      status: 200,
      data: { test: 'OK' },
      statusText: 'OK',
      config: {} as AxiosResponse['config'],
      headers: {} as AxiosResponse['headers'],
    });
  }

  testGetError(): Promise<AxiosResponse<unknown>> {
    return Promise.resolve({
      status: 500,
      data: undefined,
      statusText: 'Unexpected error',
      config: {} as AxiosResponse['config'],
      headers: {} as AxiosResponse['headers'],
    });
  }
}

describe('openApiControllerFactory', () => {
  const basePath = 'http://localhost:8080/api';
  const openApiControllerFactoryParams: IOpenApiControllerSetup<any, any> = { basePath };
  const controllerKey = 'testControllerKey';

  const controllerHooks = axiosOpenApiControllerFactory(openApiControllerFactoryParams).createAxiosOpenApiController(controllerKey, MockApi);

  const mockedController = axiosOpenApiControllerFactory({
    ...openApiControllerFactoryParams,
    enableMocking: true,
  });

  const endpointKeys = Object.keys(controllerHooks).filter((item) => item !== 'registerMockEndpoints');

  it('should create an openAPI controller with createAxiosOpenApiController factory when executed', () => {
    const factory = axiosOpenApiControllerFactory(openApiControllerFactoryParams);

    expect(factory.createAxiosOpenApiController).toBeDefined();
  });

  it('should create an createAxiosOpenApiController factory with a key for each endpoint when executed', () => {
    expect(endpointKeys.join('-')).toEqual(Object.keys(fixGeneratedClient(new MockApi())).join('-'));
  });

  it('should create controller keys and endpoint keys for each endpoint that match what was passed in when executed', () => {
    endpointKeys.forEach((baseKey) => {
      const key = baseKey as keyof MockApi;
      expect(controllerHooks[key].controllerKey).toEqual(controllerKey);
      expect(controllerHooks[key].endpointKey).toEqual(baseKey);
    });
  });

  it('should build an appropriate cache key for each endpoint when executed', () => {
    const testCacheKeyValue = 'test-cache-key-value';
    endpointKeys.forEach((baseKey) => {
      const key = baseKey as keyof MockApi;
      expect(controllerHooks[key].cacheKey(testCacheKeyValue)).toEqual(cacheKeyConcat(controllerKey, baseKey, testCacheKeyValue));
    });
  });

  it('should build an appropriate cache key starts with invalidator for each endpoint when executed', () => {
    const testCacheKeyValue = 'test-cache-key-value';
    endpointKeys.forEach((baseKey) => {
      const key = baseKey as keyof MockApi;
      // this valid key mimics the cache key for a single page of data on a paged request.
      const validKey = `${controllerKey}.${baseKey}.${testCacheKeyValue}.10.1`;
      expect(controllerHooks[key].startsWithInvalidator(testCacheKeyValue)(validKey)).toEqual(true);
    });
    endpointKeys.forEach((baseKey) => {
      const key = baseKey as keyof MockApi;
      expect(controllerHooks[key].startsWithInvalidator(testCacheKeyValue)('incorrect-key')).toEqual(false);
    });
    endpointKeys.forEach((baseKey) => {
      const key = baseKey as keyof MockApi;
      expect(controllerHooks[key].startsWithInvalidator(testCacheKeyValue)(['not', 'a', 'string'])).toEqual(false);
    });
  });

  it('should return a useQuery function for each endpoint when executed', () => {
    endpointKeys.forEach((baseKey) => {
      const key = baseKey as keyof MockApi;
      expect(controllerHooks[key]).toHaveProperty('useQuery');
      expect(controllerHooks[key].useQuery).toBeInstanceOf(Function);
    });
  });

  it('should return a useMutation function for each endpoint when executed', () => {
    endpointKeys.forEach((baseKey) => {
      const key = baseKey as keyof MockApi;
      expect(controllerHooks[key]).toHaveProperty('useMutation');
      expect(controllerHooks[key].useMutation).toBeInstanceOf(Function);
    });
  });

  it('should create a fetch function which fetches the data successfully when executed', async () => {
    await expect(controllerHooks.testGetSuccess.fetch()).resolves.toEqual({ test: 'OK' });
  });

  it('should create a fetch function which handles errors appropriately when executed', async () => {
    await expect(controllerHooks.testGetError.fetch()).rejects.toThrow('Unexpected error');
  });

  it('should mock and fetch data successfully through the fetch function when executed', async () => {
    const mockedControllerHooks = mockedController.createAxiosOpenApiController(controllerKey, MockApi);
    mockedControllerHooks.registerMockEndpoints({
      // eslint-disable-next-line @typescript-eslint/require-await
      testGetSuccess: async () => {
        return createMockAxiosSuccessResponse({ test: 'mocked-test' });
      },
    });
    await expect(mockedControllerHooks.testGetSuccess.fetch()).resolves.toEqual({ test: 'mocked-test' });
  });

  it('should throw an error when trying to fetch from an undefined mock endpoint', async () => {
    const mockedControllerHooks = mockedController.createAxiosOpenApiController(controllerKey, MockApi);

    await expect(mockedControllerHooks.testGetSuccess.fetch()).rejects.toThrow(`Mock endpoint not defined for: testControllerKey.testGetSuccess`);
  });
});
