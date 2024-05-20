import { AxiosError, type AxiosResponse } from 'axios';

import { fixGeneratedClient, isAxiosError, isAxiosResponse, unwrapAxiosPromise } from './api';

/**
 * isAxiosResponse
 */
describe('isAxiosResponse', () => {
  test('returns true if response is an AxiosResponse object', () => {
    const response: AxiosResponse<{ message: string }> = {
      data: { message: 'Hello World' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as AxiosResponse['config'],
    };
    const result = isAxiosResponse(response);
    expect(result).toBe(true);
  });

  test('returns false if response is not an AxiosResponse object', () => {
    const response = { message: 'Hello World' };
    const result = isAxiosResponse(response);
    expect(result).toBe(false);
  });
});

/**
 * isAxiosError
 */
describe('isAxiosError', () => {
  it('should return true for an AxiosError', () => {
    const axiosError = new AxiosError('Some error', '404');
    expect(isAxiosError(axiosError)).toBe(true);
  });

  it('should return false for a non-AxiosError', () => {
    const genericError = new Error('Some error');
    expect(isAxiosError(genericError)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isAxiosError(undefined)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isAxiosError(null)).toBe(false);
  });

  it('should return false for an object without isAxiosError property', () => {
    const customError = { message: 'Custom error' };
    expect(isAxiosError(customError)).toBe(false);
  });

  it('should return false for a string', () => {
    const errorMessage = 'Some error message';
    expect(isAxiosError(errorMessage)).toBe(false);
  });
});

/**
 * fixGeneratedClient
 */
describe('fixGeneratedClient', () => {
  class OriginalClient {
    private _privateProp = 'private';

    public publicMethod() {
      return 'public';
    }

    private privateMethod() {
      return 'private';
    }
  }

  it('should return a new object when executed', () => {
    const original = new OriginalClient();
    const fixed = fixGeneratedClient(original);
    expect(fixed).not.toBe(original);
  });

  it('should correct the scoping issue of public methods when executed', () => {
    const original = new OriginalClient();
    const fixed = fixGeneratedClient(original);
    expect(fixed.publicMethod()).toEqual('public');
  });
});

/**
 * unwrapAxiosPromise
 */
describe('unwrapAxiosPromise', () => {
  it('should unwrap the data from an axios response when executed', async () => {
    const data = { foo: 'bar' };
    const response = { status: 200, data, statusText: 'OK' };
    const mockFunc = jest.fn().mockResolvedValue(response);

    const result = await unwrapAxiosPromise(mockFunc);

    expect(mockFunc).toHaveBeenCalled();
    expect(result).toEqual(data);
  });

  it('should throw an error if the response status is 400 or higher when executed', async () => {
    const response = { status: 404, statusText: 'Not Found' };
    const mockFunc = jest.fn().mockResolvedValue(Promise.resolve(response));

    await expect(unwrapAxiosPromise(mockFunc)).rejects.toThrow('Not Found');
    expect(mockFunc).toHaveBeenCalled();
  });

  it('should return non-axios responses unchanged when executed with a non-axios response', async () => {
    const data = { foo: 'bar' };
    const mockFunc = jest.fn().mockResolvedValue(data);

    const result = await unwrapAxiosPromise(mockFunc);

    expect(mockFunc).toHaveBeenCalled();
    expect(result).toEqual(data);
  });
});
