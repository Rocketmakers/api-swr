import { renderHook } from '@testing-library/react';

import { useClearCache } from './useClearCache';

// key getter
const keyGetter = jest.fn().mockReturnValue(['key-1', 'key-2', 'key-3']);

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

describe('useClearCache', () => {
  it('should provide a function to clear the SWR cache when executed', async () => {
    mutate.mockClear();
    const { result } = renderHook(() => useClearCache());
    await result.current();

    expect(mutate).toHaveBeenCalledTimes(3);
    expect(mutate).toHaveBeenCalledWith('key-1', undefined, { revalidate: false });
    expect(mutate).toHaveBeenCalledWith('key-2', undefined, { revalidate: false });
    expect(mutate).toHaveBeenCalledWith('key-3', undefined, { revalidate: false });
  });
});
