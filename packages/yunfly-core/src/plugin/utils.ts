import * as path from 'path';
import logger from '@yunflyjs/loggers';
import { PluginConfig, PluginDirRes } from '../type';

/**
 * git plugin dir
 *
 * @export
 * @param {PluginConfig} plugin
 * @returns {PluginDirRes}
 */
export function getPathFromPlugin(plugin: PluginConfig): PluginDirRes {
  let pluginDir = '';
  let pluginSrc = '';

  if (plugin.path) {
    pluginDir = plugin.path;
    pluginSrc = `${pluginDir}/src`;
  } else if (plugin.package) {
    pluginDir =
      process.env.YUNFLY_TYPE === 'link' && isYunflyBuiltInPlugin(plugin.name)
        ? path.join(__dirname, `../../../node_modules/${plugin.package}`)
        : path.join(process.cwd(), `node_modules/${plugin.package}`);
    pluginSrc = `${pluginDir}/dist`;
  }

  pluginDir = pluginDir.replace(/\\/g, '//');
  pluginSrc = pluginSrc.replace(/\\/g, '//');

  return {
    pluginDir,
    pluginSrc,
    pluginPkg: `${pluginDir}/package.json`,
  };
}

/**
 * is yunfly built in plugin.
 *
 * @export
 * @param {string} pluginName
 */
export function isYunflyBuiltInPlugin(pluginName: string): boolean {
  const pluginNames = [
    'trace',
    'probe',
    'bodyParser',
    'prometheus',
    'security',
    'redis',
    'session',
    'error',
    'logger',
    'jwt',
    'routingControllersOptions',
    'response',
  ];
  return pluginNames.includes(pluginName);
}

/**
 * Is it a yunfly compliant plug-in
 *
 * @export
 * @param {PluginConfig[]} plugin
 * @returns {PluginConfig[]}
 */
export function getYunflyPlugins(plugin: PluginConfig[]): PluginConfig[] {
  return plugin.filter((item: PluginConfig): boolean => {
    const pluginName = item.package || item.path;
    if (pluginName?.includes('yunfly-plugin')) {
      return true;
    }
    logger.color('#ffff00').window().warn(`注意${pluginName}不符合yunfly插件命名规范,将不会被加载。`);
    return false;
  });
}

/**
 * merge plugin from plugin.name
 * If the name is the same
 * The latter plug-in overrides the former
 *
 * @export
 * @param {PluginConfig[]} plugin1
 * @param {PluginConfig[]} plugin2
 * @returns {PluginConfig[]}
 */
export function mergePlugins(plugin1: PluginConfig[], plugin2: PluginConfig[]): PluginConfig[] {
  plugin2 = getYunflyPlugins(plugin2);
  plugin1.forEach((item: PluginConfig, index) => {
    plugin2.forEach((item1, index1) => {
      if (item.name === item1.name) {
        plugin1[index] = item1;
        plugin2.splice(index1, 1);
      }
    });
  });
  return [...new Set([...plugin1, ...plugin2])];
}
