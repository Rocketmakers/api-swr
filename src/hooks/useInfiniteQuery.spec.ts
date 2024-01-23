import { act, renderHook } from '@testing-library/react';
import * as React from 'react';
import useSwrInfinite from 'swr/infinite';

import type { AnyPromiseFunction } from '../types';

import * as useClientFetchModule from './useClientFetch';
import { useInfiniteQuery } from './useInfiniteQuery';

// Mock index and prev data
const mockIndex = 0;
const mockPrevData = { test: 'OK' };

// Mock SWR infinite hook
jest.mock('swr/infinite', () => ({
  __esModule: true,
  default: jest.fn((key: (index: number, prevData: typeof mockPrevData) => any, innerFetcher: AnyPromiseFunction) => {
    const [data, setData] = React.useState();
    React.useEffect(() => {
      void innerFetcher(key(mockIndex, mockPrevData)).then((fetchedData) => act(() => setData(fetchedData as undefined)));
    }, [innerFetcher, key]);

    return { data };
  }),
}));

// Mock param getter
const params = { id: 'test-cache-key-value' };

// Define test data
const fetcher = jest.fn().mockReturnValue(Promise.resolve({ test: 'OK' }));
const paramGetter = jest.fn().mockReturnValue(params);
const endpointId = 'controllerKey.endpointKey';
const hookConfig = {
  cacheKey: 'id',
  params: paramGetter,
  fetchConfig: { headers: { Authorization: 'Bearer token' } },
  swrConfig: { revalidateOnFocus: false },
};

// Mock client fetch
const mockUseClientFetch = jest.fn(
  (incomingEndpointId: string, mode: string, conf: unknown, innerFetcher: AnyPromiseFunction, incomingParams: unknown) => {
    return {
      validationErrors: [],
      clientFetch: () => innerFetcher(incomingParams, conf),
      data: undefined,
      error: undefined,
      isLoading: false,
    };
  }
);
jest.mock('./useClientFetch.ts');
(useClientFetchModule.useClientFetch as jest.Mock).mockImplementation(mockUseClientFetch);

describe('useInfiniteQuery', () => {
  it('should call useSwrInfinite with the correct parameters when used', () => {
    const { result } = renderHook(() => useInfiniteQuery(endpointId, fetcher, hookConfig));
    expect(result.current).toBeTruthy();
    expect(useSwrInfinite).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), {
      revalidateOnFocus: false,
    });
  });

  it('should combine hook level and global SWR configs when used', () => {
    const { result } = renderHook(() => useInfiniteQuery(endpointId, fetcher, hookConfig, undefined, { errorRetryCount: 5 }));
    expect(result.current).toBeTruthy();
    expect(useSwrInfinite).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), {
      errorRetryCount: 5,
      revalidateOnFocus: false,
    });
  });

  it('should call the param getter with the correct parameters when used', () => {
    const { result } = renderHook(() => useInfiniteQuery(endpointId, fetcher, hookConfig));
    expect(result.current).toBeTruthy();
    expect(paramGetter).toHaveBeenCalledWith(mockIndex, mockPrevData);
  });

  it('should call useClientFetch with the correct parameters when used', () => {
    const { result } = renderHook(() => useInfiniteQuery(endpointId, fetcher, hookConfig));
    expect(result.current).toBeTruthy();
    expect(mockUseClientFetch).toHaveBeenCalledWith(endpointId, 'query', hookConfig.fetchConfig, fetcher, undefined, undefined);
  });
});
