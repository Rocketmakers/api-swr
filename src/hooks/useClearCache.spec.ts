import { renderHook } from '@testing-library/react';
import { useSWRConfig } from 'swr';

import { useClearCache } from './useClearCache';

jest.mock('swr', () => ({
  useSWRConfig: jest.fn(),
}));

describe('useClearCache', () => {
  it('should provide a function to clear the SWR cache when executed', async () => {
    const mutate = jest.fn().mockResolvedValue(null);

    (useSWRConfig as jest.Mock).mockReturnValue({ mutate });

    const { result } = renderHook(() => useClearCache());

    await result.current();

    expect(mutate).toHaveBeenCalledWith(expect.any(Function), undefined, { revalidate: false });
  });
});
