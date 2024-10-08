import { act, renderHook } from '@testing-library/react';
import * as React from 'react';
import useSwr from 'swr';

import * as useClientFetchModule from './useClientFetch';
import { useQuery } from './useQuery';
import type { AnyPromiseFunction } from '../@types/global';

// Mock SWR hook
jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn((key: string, innerFetcher: AnyPromiseFunction) => {
    const [data, setData] = React.useState();
    React.useEffect(() => {
      if (key) {
        void innerFetcher().then((fetchedData) => act(() => setData(fetchedData as undefined)));
      }
    }, [innerFetcher, key]);

    return { data };
  }),
}));

// Define test data
const fetcher = jest.fn().mockReturnValue(Promise.resolve({ test: 'OK' }));
const endpointId = 'controllerKey.endpointKey';
const hookConfig = {
  cacheKey: 'id',
  params: { id: 'test-cache-key-value' },
  fetchConfig: { headers: { Authorization: 'Bearer token' } },
  swrConfig: { revalidateOnFocus: false },
};

// Mock client fetch
const mockUseClientFetch = jest.fn((incomingEndpointId: string, mode: string, conf: unknown, innerFetcher: AnyPromiseFunction, params: unknown) => {
  return {
    validationErrors: [],
    clientFetch: () => innerFetcher(params, conf),
    data: undefined,
    error: undefined,
    isLoading: false,
  };
});
jest.mock('./useClientFetch.ts');
(useClientFetchModule.useClientFetch as jest.Mock).mockImplementation(mockUseClientFetch);

describe('useQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call useSwr with the correct parameters when used', () => {
    const { result } = renderHook(() => useQuery(endpointId, fetcher, hookConfig));
    expect(result.current).toBeTruthy();
    expect(useSwr).toHaveBeenCalledWith('controllerKey.endpointKey.test-cache-key-value', expect.any(Function), {
      revalidateOnFocus: false,
    });
  });

  it('should combine hook level and global SWR configs when used', () => {
    const { result } = renderHook(() => useQuery(endpointId, fetcher, hookConfig, undefined, undefined, { errorRetryCount: 5 }));
    expect(result.current).toBeTruthy();
    expect(useSwr).toHaveBeenCalledWith('controllerKey.endpointKey.test-cache-key-value', expect.any(Function), {
      errorRetryCount: 5,
      revalidateOnFocus: false,
    });
  });

  it('should call useClientFetch with the correct parameters when used', () => {
    const { result } = renderHook(() => useQuery(endpointId, fetcher, hookConfig));
    expect(result.current).toBeTruthy();
    expect(mockUseClientFetch).toHaveBeenCalledWith(
      endpointId,
      'query',
      hookConfig.fetchConfig,
      fetcher,
      hookConfig.params,
      undefined,
      undefined,
      undefined
    );
  });

  it('should not call fetcher if waitFor is false', () => {
    renderHook(() => useQuery(endpointId, fetcher, { ...hookConfig, waitFor: false }));
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('should call fetcher if waitFor is undefined', () => {
    renderHook(() => useQuery(endpointId, fetcher, hookConfig));
    expect(fetcher).toHaveBeenCalled();
  });

  it('should call fetcher if waitFor is true', () => {
    renderHook(() => useQuery(endpointId, fetcher, { ...hookConfig, waitFor: true }));
    expect(fetcher).toHaveBeenCalled();
  });
});
