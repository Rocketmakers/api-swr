import { genericApiControllerFactory } from '../../src';
import { AddTestArgs } from '../api/utils';

export const genericApiFactory = genericApiControllerFactory<AddTestArgs | undefined, void>({
  enableMocking: false,
  globalFetchConfig: {
    requestDelay: 1000,
    throwServerError: false,
  },
  swrConfig: {
    keepPreviousData: true,
  },
});
