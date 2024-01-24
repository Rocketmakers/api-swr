import { axiosOpenApiControllerFactory } from '../../src';

export const apiFactory = axiosOpenApiControllerFactory({
  basePath: '',
  enableMocking: false,
  swrConfig: {
    keepPreviousData: true,
  },
});
