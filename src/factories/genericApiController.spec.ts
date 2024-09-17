import { cacheKeyConcat } from '../utils/caching';
import { genericApiControllerFactory } from './genericApiController';

interface ITestConfig {
  testKey1?: string;
  testKey2?: string;
  testKey3?: string;
}

const testGetSuccess = jest.fn().mockResolvedValue(
  Promise.resolve({
    test: 'OK',
  })
);

const testGetError = jest.fn().mockRejectedValue(new Error('Unexpected error'));

/** mock controller */
const mockApi = {
  testGetSuccess,
  testGetError,
};

describe('genericControllerFactory', () => {
  const controllerKey = 'testControllerKey';

  const controllerFactory = genericApiControllerFactory({
    globalFetchConfig: {
      testKey1: 'testValue1',
      testKey2: 'testValue2',
    } as ITestConfig,
  });

  const controllerHooks = controllerFactory.createGenericApiController(controllerKey, mockApi);

  const mockedController = genericApiControllerFactory({
    enableMocking: true,
  });

  const endpointKeys = Object.keys(controllerHooks).filter((item) => item !== 'registerMockEndpoints');

  it('should create a generic controller with createGenericApiController factory when executed', () => {
    const factory = genericApiControllerFactory();
    expect(factory.createGenericApiController).toBeDefined();
  });

  it('should create a genetic factory with a key for each endpoint when executed', () => {
    expect(endpointKeys.join('-')).toEqual(Object.keys(mockApi).join('-'));
  });

  it('should create controller keys and endpoint keys for each endpoint that match what was passed in when executed', () => {
    endpointKeys.forEach((baseKey) => {
      const key = baseKey as keyof typeof mockApi;
      expect(controllerHooks[key].controllerKey).toEqual(controllerKey);
      expect(controllerHooks[key].endpointKey).toEqual(baseKey);
    });
  });

  it('should build an appropriate cache key getter, which works without an additional value', () => {
    endpointKeys.forEach((baseKey) => {
      const key = baseKey as keyof typeof mockApi;
      expect(controllerHooks[key].cacheKey()).toEqual(cacheKeyConcat(controllerKey, baseKey));
    });
  });

  it('should build an appropriate cache key getter, which works when a string is passed as the additional value', () => {
    const testCacheKeyValue = 'test-cache-key-value';
    endpointKeys.forEach((baseKey) => {
      const key = baseKey as keyof typeof mockApi;
      expect(controllerHooks[key].cacheKey(testCacheKeyValue)).toEqual(cacheKeyConcat(controllerKey, baseKey, testCacheKeyValue));
    });
  });

  it('should build an appropriate cache key getter, which works when an array of strings is passed as the additional value', () => {
    const testCacheKeyValue = ['test-cache-key-value', 'test-cache-key-value-2', 'test-cache-key-value-3'];
    endpointKeys.forEach((baseKey) => {
      const key = baseKey as keyof typeof mockApi;
      expect(controllerHooks[key].cacheKey(testCacheKeyValue)).toEqual(cacheKeyConcat(controllerKey, baseKey, ...testCacheKeyValue));
    });
  });

  it('should build an appropriate cache key starts with getter, which works without an additional value', () => {
    endpointKeys.forEach((baseKey) => {
      const key = baseKey as keyof typeof mockApi;
      // this valid key mimics the cache key for a single page of data on a paged request.
      const validKey = `${controllerKey}.${baseKey}.10.1`;
      expect(controllerHooks[key].startsWithInvalidator()(validKey)).toEqual(true);
    });
    endpointKeys.forEach((baseKey) => {
      const key = baseKey as keyof typeof mockApi;
      expect(controllerHooks[key].startsWithInvalidator()('incorrect-key')).toEqual(false);
    });
    endpointKeys.forEach((baseKey) => {
      const key = baseKey as keyof typeof mockApi;
      expect(controllerHooks[key].startsWithInvalidator()(['not', 'a', 'string'])).toEqual(false);
    });
  });

  it('should build an appropriate cache key starts with getter, which works when a string is passed as the additional value', () => {
    const testCacheKeyValue = 'test-cache-key-value';
    endpointKeys.forEach((baseKey) => {
      const key = baseKey as keyof typeof mockApi;
      // this valid key mimics the cache key for a single page of data on a paged request.
      const validKey = `${controllerKey}.${baseKey}.${testCacheKeyValue}.10.1`;
      expect(controllerHooks[key].startsWithInvalidator(testCacheKeyValue)(validKey)).toEqual(true);
    });
    endpointKeys.forEach((baseKey) => {
      const key = baseKey as keyof typeof mockApi;
      expect(controllerHooks[key].startsWithInvalidator(testCacheKeyValue)('incorrect-key')).toEqual(false);
    });
    endpointKeys.forEach((baseKey) => {
      const key = baseKey as keyof typeof mockApi;
      expect(controllerHooks[key].startsWithInvalidator(testCacheKeyValue)(['not', 'a', 'string'])).toEqual(false);
    });
  });

  it('should build an appropriate cache key starts with getter, which works when an array of strings is passed as the additional value', () => {
    const testCacheKeyValue = ['test-cache-key-value', 'test-cache-key-value-2', 'test-cache-key-value-3'];
    endpointKeys.forEach((baseKey) => {
      const key = baseKey as keyof typeof mockApi;
      // this valid key mimics the cache key for a single page of data on a paged request.
      const validKey = `${controllerKey}.${baseKey}.${testCacheKeyValue.join('.')}.10.1`;
      expect(controllerHooks[key].startsWithInvalidator(testCacheKeyValue)(validKey)).toEqual(true);
    });
    endpointKeys.forEach((baseKey) => {
      const key = baseKey as keyof typeof mockApi;
      expect(controllerHooks[key].startsWithInvalidator(testCacheKeyValue)('incorrect-key')).toEqual(false);
    });
    endpointKeys.forEach((baseKey) => {
      const key = baseKey as keyof typeof mockApi;
      expect(controllerHooks[key].startsWithInvalidator(testCacheKeyValue)(['not', 'a', 'string'])).toEqual(false);
    });
  });

  it('should return a useQuery function for each endpoint when executed', () => {
    endpointKeys.forEach((baseKey) => {
      const key = baseKey as keyof typeof mockApi;
      expect(controllerHooks[key]).toHaveProperty('useQuery');
      expect(controllerHooks[key].useQuery).toBeInstanceOf(Function);
    });
  });

  it('should return a useMutation function for each endpoint when executed', () => {
    endpointKeys.forEach((baseKey) => {
      const key = baseKey as keyof typeof mockApi;
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
    const mockedControllerHooks = mockedController.createGenericApiController(controllerKey, mockApi);
    mockedControllerHooks.registerMockEndpoints({
      testGetSuccess: () => {
        return Promise.resolve({ test: 'mocked-test' });
      },
    });
    await expect(mockedControllerHooks.testGetSuccess.fetch()).resolves.toEqual({ test: 'mocked-test' });
  });

  it('should throw an error when trying to fetch from an undefined mock endpoint', async () => {
    const mockedControllerHooks = mockedController.createGenericApiController(controllerKey, mockApi);
    await expect(mockedControllerHooks.testGetSuccess.fetch()).rejects.toThrow('Mock endpoint not defined for: testControllerKey.testGetSuccess');
  });

  it('should pass global fetch config to each endpoint method', async () => {
    await controllerHooks.testGetSuccess.fetch();
    expect(testGetSuccess).toHaveBeenCalledWith(undefined, { testKey1: 'testValue1', testKey2: 'testValue2' });
    testGetSuccess.mockClear();
  });

  it('should pass global fetch config to each endpoint method, and merge controller level config over the top', async () => {
    const newController = controllerFactory.createGenericApiController(controllerKey, mockApi, { testKey2: 'testValueController2' });
    await newController.testGetSuccess.fetch();
    expect(testGetSuccess).toHaveBeenCalledWith(undefined, { testKey1: 'testValue1', testKey2: 'testValueController2' });
    testGetSuccess.mockClear();
  });

  it('should pass global fetch config to each endpoint method, merge controller level config over the top, and merge fetch config on at the end', async () => {
    const newController = controllerFactory.createGenericApiController(controllerKey, mockApi, { testKey2: 'testValueController2' });
    await newController.testGetSuccess.fetch(undefined, { testKey3: 'testValue3' });
    expect(testGetSuccess).toHaveBeenCalledWith(undefined, { testKey1: 'testValue1', testKey2: 'testValueController2', testKey3: 'testValue3' });
    testGetSuccess.mockClear();
  });
});
