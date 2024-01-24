/**
 * Utility functions for API interfacing.
 * --------------------------------------
 * These functions are designed to facilitate interaction with an API client
 */
import { AxiosError, type AxiosResponse } from 'axios';

import type { AnyPromiseFunction, UnwrapAxiosResponse } from '../types';

/**
 * Checks whether an API response object is an Axios response.
 * @param {AxiosResponse<TResponse> | TResponse} response - The API response object to be checked.
 * @returns {boolean} - A boolean indicating whether the API response object is an Axios response.
 * @template TResponse - The type of data returned by the Axios response.
 */
export const isAxiosResponse = <TResponse>(response: AxiosResponse<TResponse> | TResponse): response is AxiosResponse<TResponse> => {
  return !!(response as AxiosResponse<TResponse>).status;
};

/**
 * Checks if the provided error is an AxiosError.
 * @param {unknown} error - The error to be checked.
 * @returns {boolean} Returns true if the error is an AxiosError, false otherwise.
 */
export const isAxiosError = (error: unknown): error is AxiosError => {
  return !!(error as AxiosError)?.isAxiosError;
};

/**
 * Iterates over an OpenAPI TypeScript controller and corrects the scoping issues by adding an initial arrow function to each class method.
 * @param original - The original OpenAPI TypeScript controller to be fixed.
 * @returns A new OpenAPI TypeScript controller with fixed scoping issues.
 * @typeparam T - The type of the OpenAPI TypeScript controller to be fixed.
 */
export const fixGeneratedClient = <T>(original: T): T => {
  const keys = new Set([...Object.getOwnPropertyNames(Object.getPrototypeOf(original)), ...Object.getOwnPropertyNames(original)]);
  return Array.from(keys).reduce((client: object, func) => {
    if (func !== 'constructor') {
      // eslint-disable-next-line no-param-reassign
      client[func] = (...args: Array<unknown>) => (original as any)[func](...args);
    }
    return client;
  }, {}) as T;
};

/**
 * Unwraps the data from an axios API response.
 * @async
 * @template TFunc - The function to execute and unwrap the response data from.
 * @param {TFunc} func - The function to execute.
 * @returns {Promise<UnwrapAxiosResponse<TFunc>>} - The unwrapped data from the API response.
 * @throws {Error} - If the API response status is 400 or higher, an error with the response is thrown.
 */
export const unwrapAxiosPromise = async <TFunc extends AnyPromiseFunction>(func: TFunc): Promise<UnwrapAxiosResponse<TFunc>> => {
  const response: unknown = await func();
  if (isAxiosResponse(response)) {
    if (response.status >= 400) {
      throw new AxiosError(response.statusText, response.status.toString(), response.config, response.request, response);
    }
    return response.data as UnwrapAxiosResponse<TFunc>;
  }
  return response as UnwrapAxiosResponse<TFunc>;
};
