import { renderHook, act, waitFor } from '@testing-library/react';

import { useClientFetch } from './useClientFetch';

const responseData = { id: 1, name: 'John Doe' };
const localFetchWrapperMock = jest.fn(() => Promise.resolve(responseData));
const globalFetchWrapperMock = jest.fn(() => Promise.resolve(responseData));
const fetcherMock = jest.fn(() => Promise.resolve(responseData));
const apProcessingMock = jest.fn(() => ({
  processingResponse: 'ok',
}));
const globalFetchWrapperHookMock = jest.fn(() => globalFetchWrapperMock);

describe('useClientFetch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch data and update state correctly when used', async () => {
    const { result } = renderHook(() =>
      useClientFetch('controller.endpoint', 'query', { timeout: 5000 }, fetcherMock, { param1: 'value1' }, apProcessingMock)
    );

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
    expect(result.current.isLoading).toBe(false);

    act(() => {
      void result.current.clientFetch();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(true));

    expect(fetcherMock).toHaveBeenCalledTimes(1);
    expect(fetcherMock).toHaveBeenCalledWith({ param1: 'value1' }, { timeout: 5000 });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(responseData);
    expect(result.current.error).toBeUndefined();
    expect(result.current.processingResponse).toEqual({
      processingResponse: 'ok',
    });

    expect(apProcessingMock).toHaveBeenCalledWith({
      data: responseData,
      mode: 'query',
      isLoading: false,
      endpointId: 'controller.endpoint',
      params: { param1: 'value1' },
      error: undefined,
    });
  });

  it('should handle fetch error and update state correctly when used', async () => {
    const error = new Error('API error');
    fetcherMock.mockRejectedValue(error);

    const { result } = renderHook(() =>
      useClientFetch('controller.endpoint', 'query', { timeout: 5000 }, fetcherMock, { param1: 'value1' }, apProcessingMock)
    );

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
    expect(result.current.isLoading).toBe(false);

    act(() => {
      void result.current.clientFetch();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(true));

    expect(fetcherMock).toHaveBeenCalledTimes(1);
    expect(fetcherMock).toHaveBeenCalledWith({ param1: 'value1' }, { timeout: 5000 });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toEqual(error);
    expect(result.current.processingResponse).toEqual({
      processingResponse: 'ok',
    });

    expect(apProcessingMock).toHaveBeenCalledWith({
      data: undefined,
      mode: 'query',
      isLoading: false,
      endpointId: 'controller.endpoint',
      params: { param1: 'value1' },
      error,
    });
  });

  it('should use global fetch wrapper when provided', async () => {
    const { result } = renderHook(() =>
      useClientFetch('controller.endpoint', 'query', { timeout: 5000 }, fetcherMock, { param1: 'value1' }, undefined, globalFetchWrapperHookMock)
    );

    act(() => {
      void result.current.clientFetch();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(true));

    expect(globalFetchWrapperHookMock).toHaveBeenCalled();

    expect(globalFetchWrapperMock).toHaveBeenCalledWith({
      rootFetcher: fetcherMock,
      params: { param1: 'value1' },
      mode: 'query',
      config: { timeout: 5000 },
      endpointId: 'controller.endpoint',
    });
  });

  it('should use local fetch wrapper when provided', async () => {
    const { result } = renderHook(() =>
      useClientFetch(
        'controller.endpoint',
        'query',
        { timeout: 5000 },
        fetcherMock,
        { param1: 'value1' },
        undefined,
        undefined,
        localFetchWrapperMock
      )
    );

    act(() => {
      void result.current.clientFetch();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(true));

    expect(localFetchWrapperMock).toHaveBeenCalledWith({
      rootFetcher: fetcherMock,
      params: { param1: 'value1' },
      mode: 'query',
      config: { timeout: 5000 },
      endpointId: 'controller.endpoint',
    });
  });

  it('should use local fetch wrapper in place of global version when both are provided', async () => {
    const { result } = renderHook(() =>
      useClientFetch(
        'controller.endpoint',
        'query',
        { timeout: 5000 },
        fetcherMock,
        { param1: 'value1' },
        undefined,
        globalFetchWrapperHookMock,
        localFetchWrapperMock
      )
    );

    act(() => {
      void result.current.clientFetch();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(true));

    expect(globalFetchWrapperHookMock).toHaveBeenCalled();

    expect(globalFetchWrapperMock).not.toHaveBeenCalled();

    expect(localFetchWrapperMock).toHaveBeenCalledWith({
      rootFetcher: fetcherMock,
      params: { param1: 'value1' },
      mode: 'query',
      config: { timeout: 5000 },
      endpointId: 'controller.endpoint',
    });
  });
});
