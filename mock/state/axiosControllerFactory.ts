import { axiosOpenApiControllerFactory } from '../../src';

export const axiosApiFactory = axiosOpenApiControllerFactory({
  basePath: '',
  enableMocking: false,
  swrConfig: {
    keepPreviousData: true,
  },
});
