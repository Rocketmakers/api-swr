import type { AxiosResponse } from 'axios';
import { fixGeneratedClient } from '../utils/api';

import { endpointIdFactory } from './endpointIds';

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

describe('endpointIdFactory', () => {
  const controllerKey = 'testControllerKey';
  const result = endpointIdFactory(controllerKey, MockApi);
  const endpointKeys = Object.keys(result).filter((item) => item !== 'controllerKey');

  it('should create a dictionary with a controller key exported when executed', () => {
    expect(result.controllerKey).toEqual(controllerKey);
  });

  it('should create a dictionary with a key for each endpoint when executed', () => {
    expect(endpointKeys.join('-')).toEqual(Object.keys(fixGeneratedClient(new MockApi())).join('-'));
  });

  it('should create a dictionary with an endpointId function which returns the correct ID when executed', () => {
    endpointKeys.forEach((key) => {
      const castKey = key as keyof MockApi;
      expect(result[castKey].endpointId).toBeDefined();
      expect(result[castKey].endpointId()).toEqual(`${controllerKey}.${castKey}`);
    });
  });

  it('should create a dictionary with an endpointId function which correctly appends an additional cache key when executed', () => {
    endpointKeys.forEach((key) => {
      const castKey = key as keyof MockApi;
      expect(result[castKey].endpointId).toBeDefined();
      expect(result[castKey].endpointId('testCacheKey')).toEqual(`${controllerKey}.${castKey}.testCacheKey`);
    });
  });
});
