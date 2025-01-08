import type { AxiosResponse } from 'axios';

import { renderHook } from '@testing-library/react';
import { fixGeneratedClient } from '../utils/api';
import { cacheKeyConcat } from '../utils/caching';
import { createMockAxiosErrorResponse, createMockAxiosSuccessResponse } from '../utils/mocking';

import { axiosOpenApiControllerFactory } from './axiosOpenApiController';
import { IOpenApiControllerSetup } from '../@types/axiosOpenApiController';

/** mock responses */
const successResponse = createMockAxiosSuccessResponse({ test: 'OK' });
const errorResponse = createMockAxiosErrorResponse(500, 'Unexpected error');

/** mock OpenAPI controller */
class MockApi {
  testGetSuccess(): Promise<AxiosResponse<{ test: string }>> {
    return Promise.resolve(successResponse);
  }

  testGetError(): Promise<AxiosResponse<unknown>> {
    return Promise.resolve(errorResponse);
  }
}

describe('axiosOpenApiControllerFactory', () => {
  const basePath = 'http://localhost:8080/api';
  const axiosOpenApiControllerFactoryParams: IOpenApiControllerSetup<any, any> = { basePath };
  const controllerKey = 'testControllerKey';

  const controller = axiosOpenApiControllerFactory(axiosOpenApiControllerFactoryParams);
  const controllerHooks = controller.createAxiosOpenApiController(controllerKey, MockApi);

  const mockedController = axiosOpenApiControllerFactory({
    ...axiosOpenApiControllerFactoryParams,
    enableMocking: true,
  });

  const endpointKeys = Object.keys(controllerHooks).filter((item) => item !== 'registerMockEndpoints');

  it('should create an openAPI controller with createAxiosOpenApiController factory when executed', () => {
    const factory = axiosOpenApiControllerFactory(axiosOpenApiControllerFactoryParams);

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

  it('should build an appropriate cache key getter, which works without an additional value', () => {
    endpointKeys.forEach((baseKey) => {
      const key = baseKey as keyof MockApi;
      expect(controllerHooks[key].cacheKey()).toEqual(cacheKeyConcat(controllerKey, baseKey));
    });
  });

  it('should build an appropriate cache key getter, which works when a string is passed as the additional value', () => {
    const testCacheKeyValue = 'test-cache-key-value';
    endpointKeys.forEach((baseKey) => {
      const key = baseKey as keyof MockApi;
      expect(controllerHooks[key].cacheKey(testCacheKeyValue)).toEqual(cacheKeyConcat(controllerKey, baseKey, testCacheKeyValue));
    });
  });

  it('should build an appropriate cache key getter, which works when an array of strings is passed as the additional value', () => {
    const testCacheKeyValue = ['test-cache-key-value', 'test-cache-key-value-2', 'test-cache-key-value-3'];
    endpointKeys.forEach((baseKey) => {
      const key = baseKey as keyof MockApi;
      expect(controllerHooks[key].cacheKey(testCacheKeyValue)).toEqual(cacheKeyConcat(controllerKey, baseKey, ...testCacheKeyValue));
    });
  });

  it('should build an appropriate cache key starts with getter, which works without an additional value', () => {
    endpointKeys.forEach((baseKey) => {
      const key = baseKey as keyof MockApi;
      // this valid key mimics the cache key for a single page of data on a paged request.
      const validKey = `${controllerKey}.${baseKey}.10.1`;
      expect(controllerHooks[key].startsWithInvalidator()(validKey)).toEqual(true);
    });
    endpointKeys.forEach((baseKey) => {
      const key = baseKey as keyof MockApi;
      expect(controllerHooks[key].startsWithInvalidator()('incorrect-key')).toEqual(false);
    });
    endpointKeys.forEach((baseKey) => {
      const key = baseKey as keyof MockApi;
      expect(controllerHooks[key].startsWithInvalidator()(['not', 'a', 'string'])).toEqual(false);
    });
  });

  it('should build an appropriate cache key starts with getter, which works when a string is passed as the additional value', () => {
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

  it('should build an appropriate cache key starts with getter, which works when an array of strings is passed as the additional value', () => {
    const testCacheKeyValue = ['test-cache-key-value', 'test-cache-key-value-2', 'test-cache-key-value-3'];
    endpointKeys.forEach((baseKey) => {
      const key = baseKey as keyof MockApi;
      // this valid key mimics the cache key for a single page of data on a paged request.
      const validKey = `${controllerKey}.${baseKey}.${testCacheKeyValue.join('.')}.10.1`;
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
    await expect(controllerHooks.testGetSuccess.fetch()).resolves.toEqual(successResponse);
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
    await expect(mockedControllerHooks.testGetSuccess.fetch()).resolves.toEqual({ ...successResponse, data: { test: 'mocked-test' } });
  });

  it('should call mock function when enableMocking is passed through query hook config', async () => {
    const localMockControllerHooks = controller.createAxiosOpenApiController(controllerKey, MockApi);
    const mockTestSuccess = jest.fn();
    localMockControllerHooks.registerMockEndpoints({
      // eslint-disable-next-line @typescript-eslint/require-await
      testGetSuccess: mockTestSuccess,
    });
    renderHook(() => localMockControllerHooks.testGetSuccess.useQuery({ enableMocking: true, params: { hello: 'test-query' } }));
    expect(mockTestSuccess).toHaveBeenCalledWith({ hello: 'test-query' }, undefined);
  });

  it('should call mock function when enableMocking is passed through infinite query hook config', async () => {
    const localMockControllerHooks = controller.createAxiosOpenApiController(controllerKey, MockApi);
    const mockTestSuccess = jest.fn();
    localMockControllerHooks.registerMockEndpoints({
      // eslint-disable-next-line @typescript-eslint/require-await
      testGetSuccess: mockTestSuccess,
    });
    renderHook(() => localMockControllerHooks.testGetSuccess.useInfiniteQuery({ enableMocking: true, params: () => ({ hello: 'test-query' }) }));
    expect(mockTestSuccess).toHaveBeenCalledWith({ hello: 'test-query' }, undefined);
  });

  it('should call mock function when enableMocking is passed through mutation hook config', async () => {
    const localMockControllerHooks = controller.createAxiosOpenApiController(controllerKey, MockApi);
    const mockTestSuccess = jest.fn();
    localMockControllerHooks.registerMockEndpoints({
      // eslint-disable-next-line @typescript-eslint/require-await
      testGetSuccess: mockTestSuccess,
    });
    const { result } = renderHook(() =>
      localMockControllerHooks.testGetSuccess.useMutation({ enableMocking: true, params: { hello: 'test-mutation' } })
    );
    await result.current.clientFetch();
    expect(mockTestSuccess).toHaveBeenCalledWith({ hello: 'test-mutation' }, undefined);
  });

  it('should throw an error when trying to fetch from an undefined mock endpoint', async () => {
    const mockedControllerHooks = mockedController.createAxiosOpenApiController(controllerKey, MockApi);

    await expect(mockedControllerHooks.testGetSuccess.fetch()).rejects.toThrow(`Mock endpoint not defined for: testControllerKey.testGetSuccess`);
  });
});
