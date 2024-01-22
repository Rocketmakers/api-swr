import { cacheKeyConcat, readCacheKey } from './caching';

/**
 * cacheKeyConcat
 */
describe('cacheKeyConcat', () => {
  test('returns concatenated cache key string', () => {
    const result = cacheKeyConcat('user', '123', undefined, 'profile');
    expect(result).toEqual('user.123.profile');
  });

  test('returns empty string for undefined arguments', () => {
    const result = cacheKeyConcat(undefined, 'posts', undefined);
    expect(result).toEqual('posts');
  });

  test('returns empty string for no arguments', () => {
    const result = cacheKeyConcat();
    expect(result).toEqual('');
  });
});

/**
 * readCacheKey
 */
describe('readCacheKey', () => {
  it('should return endpointId when cacheKey is not specified', () => {
    const result = readCacheKey('endpoint');
    expect(result).toEqual('endpoint');
  });

  it('should return cache key built when executed with a string parameter', () => {
    const result = readCacheKey('endpoint', 'id', { id: 123 });
    expect(result).toEqual('endpoint.123');
  });

  it('should return cache key built when executed with an array of string parameters', () => {
    const result = readCacheKey('endpoint', ['id', 'name'], { id: 123, name: 'test' });
    expect(result).toEqual('endpoint.123.test');
  });

  it('should return cache key built when executed with a function', () => {
    const cacheKey = (params?: { id: number; name: string }) => `${params?.id}-${params?.name}`;
    const result = readCacheKey('endpoint', cacheKey, { id: 123, name: 'test' });
    expect(result).toEqual('endpoint.123-test');
  });

  it('should return undefined when cache key function returns falsy value', () => {
    const cacheKey = () => '';
    const result = readCacheKey('endpoint', cacheKey, { id: 123, name: 'test' });
    expect(result).toBeUndefined();
  });

  it('should strip out values when any of the cache key array parameters are falsy', () => {
    const result1 = readCacheKey('endpoint', ['id', 'name'], { id: 123, name: '' });
    expect(result1).toBe('endpoint.123');

    const result2 = readCacheKey('endpoint', ['id', 'name'], { id: 123, name: undefined });
    expect(result2).toBe('endpoint.123');
  });
});
