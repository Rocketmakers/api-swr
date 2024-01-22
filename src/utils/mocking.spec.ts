import { createMockAxiosErrorResponse, createMockAxiosResponse, createMockAxiosSuccessResponse } from './mocking';

describe('createMockAxiosResponse', () => {
  it('should return a correct response object when executed', () => {
    const data = { key: 'value' };
    const response = createMockAxiosResponse({ data });

    expect(response).toEqual({
      data,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: {},
      },
    });
  });
});

describe('createSuccessResponse', () => {
  it('should return a correct success response object when executed', () => {
    const data = { key: 'value' };
    const response = createMockAxiosSuccessResponse(data);

    expect(response).toEqual({
      data,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: {},
      },
    });
  });
});

describe('createErrorResponse', () => {
  it('should return a correct error response object when executed', () => {
    const response = createMockAxiosErrorResponse();

    expect(response).toEqual({
      data: {},
      status: 500,
      statusText: 'Error',
      headers: {},
      config: {
        headers: {},
      },
    });
  });
});
