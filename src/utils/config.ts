/**
 * Combines a root query config with one or more global fetch configs.
 *
 * This function merges the `fetchConfig` from `queryConfig` with the provided
 * global fetch configurations. The properties in the `queryConfig.fetchConfig`
 * take precedence over those in the global configurations. If no configurations
 * are provided, it returns `undefined`.
 *
 * @template TConfig - The type of the fetch configuration object.
 * @template TRootConfig - The type of the root configuration object, which includes an optional `fetchConfig` property.
 *
 * @param {TRootConfig} [queryConfig] - The root configuration object which may contain a `fetchConfig`.
 * @param {...Array<TConfig>} globalFetchConfigs - One or more global fetch configurations to be merged.
 *
 * @returns {TRootConfig | undefined} - The combined configuration object or `undefined` if no valid configurations are provided.
 */
export const combineConfigs = <TConfig extends object | undefined, TRootConfig extends { fetchConfig?: TConfig }>(
  queryConfig?: TRootConfig,
  ...globalFetchConfigs: Array<TConfig>
): TRootConfig | undefined => {
  if (!queryConfig && !globalFetchConfigs.length) {
    return undefined;
  }
  if (!queryConfig?.fetchConfig && !globalFetchConfigs.length) {
    return queryConfig;
  }
  return {
    ...queryConfig,
    fetchConfig: { ...globalFetchConfigs.reduce((acc, c) => ({ ...acc, ...c }), {} as TConfig), ...queryConfig?.fetchConfig },
  } as TRootConfig;
};
