import { AxiosRequestConfig, AxiosResponse, AxiosResponseHeaders } from 'axios';

/**
 * Interface for the parameters required to create a mock Axios response.
 */
interface MockResponseParams<T> {
  /**
   * The data to include in the response.
   */
  data: T;
  /**
   * The status code for the response. Defaults to 200.
   */
  status?: number;
  /**
   * The status text for the response. Defaults to 'OK'.
   */
  statusText?: string;
  /**
   * The headers for the response. Defaults to an empty object.
   */
  headers?: AxiosResponseHeaders;
  /**
   * The config for the response. Defaults to an empty object.
   */
  config?: AxiosRequestConfig;
}

/**
 * Creates a mock Axios response.
 * @returns An AxiosResponse with the provided parameters.
 */
export const createMockAxiosResponse = <T>({
  data,
  status = 200,
  statusText = 'OK',
  headers = {} as AxiosResponseHeaders,
  config = {},
}: MockResponseParams<T>): AxiosResponse<T> => {
  return {
    data,
    status,
    statusText,
    headers,
    config: { ...config, headers },
  };
};

/**
 * Creates a successful mock Axios response.
 *
 * @param data - The data to include in the response.
 * @param status - The status code for the response. Defaults to 200.
 *
 * @returns An AxiosResponse with a status of 200 (or the provided status) and the provided data.
 */
export const createMockAxiosSuccessResponse = <T>(data: T, status = 200): AxiosResponse<T> => {
  return createMockAxiosResponse({
    data,
    status,
    statusText: 'OK',
  });
};

/**
 * Creates an error mock Axios response.
 * @param status - The status code for the response. Defaults to 500.
 * @returns An AxiosResponse with a status of 500 (or the provided status) and an empty data object.
 */
export const createMockAxiosErrorResponse = <T>(status = 500, statusText = 'Error'): AxiosResponse<T> => {
  return createMockAxiosResponse({
    data: {} as T,
    status,
    statusText,
  });
};
