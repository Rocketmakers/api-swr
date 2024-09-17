import { combineConfigs } from './config';

interface IThreeKeyConfig {
  key1?: string;
  key2?: string;
  key3?: string;
}

describe('combineConfigs', () => {
  it('should return undefined if both queryConfig and globalFetchConfigs are not provided', () => {
    const result = combineConfigs(undefined);
    expect(result).toBeUndefined();
  });

  it('should return the queryConfig if no globalFetchConfigs are provided', () => {
    const queryConfig = { fetchConfig: { key1: 'value1' } };
    const result = combineConfigs(queryConfig);
    expect(result).toEqual(queryConfig);
  });

  it('should merge queryConfig.fetchConfig and globalFetchConfigs', () => {
    const queryConfig = { fetchConfig: { key1: 'value1' } as IThreeKeyConfig };
    const globalFetchConfig1: IThreeKeyConfig = { key2: 'value2' };
    const globalFetchConfig2: IThreeKeyConfig = { key3: 'value3' };

    const result = combineConfigs(queryConfig, globalFetchConfig1, globalFetchConfig2);

    expect(result).toEqual({
      fetchConfig: {
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      },
    });
  });

  it('should prioritize queryConfig.fetchConfig values over globalFetchConfigs', () => {
    const queryConfig = { fetchConfig: { key1: 'queryValue', key2: 'queryValue2' } as IThreeKeyConfig };
    const globalFetchConfig1: IThreeKeyConfig = { key1: 'globalValue1' };
    const globalFetchConfig2: IThreeKeyConfig = { key2: 'globalValue2', key3: 'globalValue3' };

    const result = combineConfigs(queryConfig, globalFetchConfig1, globalFetchConfig2);

    expect(result).toEqual({
      fetchConfig: {
        key1: 'queryValue',
        key2: 'queryValue2',
        key3: 'globalValue3',
      },
    });
  });

  it('should return the merged globalFetchConfigs if queryConfig is undefined', () => {
    const globalFetchConfig1: IThreeKeyConfig = { key1: 'value1' };
    const globalFetchConfig2: IThreeKeyConfig = { key2: 'value2' };

    const result = combineConfigs(undefined, globalFetchConfig1, globalFetchConfig2);

    expect(result).toEqual({
      fetchConfig: {
        key1: 'value1',
        key2: 'value2',
      },
    });
  });

  it('should return the queryConfig if globalFetchConfigs are empty', () => {
    const queryConfig = { fetchConfig: { key1: 'value1' } };

    const result = combineConfigs(queryConfig);

    expect(result).toEqual(queryConfig);
  });
});
