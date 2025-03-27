import { renderHook } from '@testing-library/react';
import { useCacheManager } from './useCacheManager';

// key getter
const keyGetter = jest.fn().mockReturnValue(['match-1', 'match-2', 'not-found']);

// mutate
const mutate = jest.fn();

// Mock SWR
jest.mock('swr', () => {
  const actual = jest.requireActual('swr');

  return {
    ...actual,
    useSWRConfig: jest.fn(() => ({
      cache: {
        keys: keyGetter,
        get: jest.fn(),
        set: jest.fn(),
        delete: jest.fn(),
      },
      mutate,
    })),
  };
});

describe('useCacheManager', () => {
  it('mutate should call SWR mutate with args', async () => {
    mutate.mockClear();
    const { result } = renderHook(() => useCacheManager());
    const arg1 = {};
    const arg2 = true;
    await result.current.mutate('match-1', arg1, arg2);
    expect(mutate).toHaveBeenCalledWith('match-1', arg1, arg2);
  });

  it('mutateInfinite should call SWR mutate for each matching key', async () => {
    mutate.mockClear();
    const { result } = renderHook(() => useCacheManager());
    const arg1 = {};
    const arg2 = true;
    await result.current.mutateInfinite('match', arg1, arg2);
    expect(mutate).toHaveBeenCalledTimes(2);
    expect(mutate).toHaveBeenCalledWith('match-1', arg1, arg2);
    expect(mutate).toHaveBeenCalledWith('match-2', arg1, arg2);
    expect(mutate).not.toHaveBeenCalledWith('not-found', arg1, arg2);
  });

  it('invalidate should call SWR mutate with key', async () => {
    mutate.mockClear();
    const { result } = renderHook(() => useCacheManager());
    await result.current.invalidate('match-1');
    expect(mutate).toHaveBeenCalledWith('match-1');
  });

  it('invalidateInfinite should call SWR mutate for each matching key', async () => {
    mutate.mockClear();
    const { result } = renderHook(() => useCacheManager());
    await result.current.invalidateInfinite('match');
    expect(mutate).toHaveBeenCalledTimes(2);
    expect(mutate).toHaveBeenCalledWith('match-1');
    expect(mutate).toHaveBeenCalledWith('match-2');
    expect(mutate).not.toHaveBeenCalledWith('not-found');
  });

  it('should provide a function to clear the SWR cache when executed', async () => {
    mutate.mockClear();
    const { result } = renderHook(() => useCacheManager());
    await result.current.clearAll();

    expect(mutate).toHaveBeenCalledTimes(3);
    expect(mutate).toHaveBeenCalledWith('match-1', undefined, { revalidate: false });
    expect(mutate).toHaveBeenCalledWith('match-2', undefined, { revalidate: false });
    expect(mutate).toHaveBeenCalledWith('not-found', undefined, { revalidate: false });
  });
});
