import { PluginConfig } from '../loader/types';
import { ApolloConfig, Config } from '../type';
import { YUNKE_ENV, deepMerge } from '../util';
import { getPathFromPlugin } from './utils';

/**
 * get plugin config
 * bff config > plugin config > yunfly config
 * @export
 * @param {PluginConfig} plugin
 */
export default function getPluginConfig(plugin: PluginConfig, apolloConfig: ApolloConfig): Config {
  const { pluginSrc } = getPathFromPlugin(plugin);
  const defaultConfigPath = `${pluginSrc}/config/config.default`;
  const envConfigPath = `${pluginSrc}/config/config.${YUNKE_ENV}`;

  let config: Config = {};
  let pluginDefaultConfig: any;
  let pluginEnvConfig: any;

  try {
    pluginDefaultConfig = require(defaultConfigPath).default;
  } catch (err: any) {
    // do nothing
  }

  try {
    pluginEnvConfig = require(envConfigPath).default;
  } catch (err: any) {
    // do nothing
  }

  if (pluginDefaultConfig) {
    config = pluginDefaultConfig(apolloConfig);
  }

  if (pluginEnvConfig) {
    config = deepMerge(config, pluginEnvConfig(apolloConfig));
  }

  return config;
}
