import { openApiControllerFactory } from '../../src';

export const apiFactory = openApiControllerFactory({
  basePath: '',
  enableMocking: false,
  swrConfig: {
    keepPreviousData: true,
  },
});
