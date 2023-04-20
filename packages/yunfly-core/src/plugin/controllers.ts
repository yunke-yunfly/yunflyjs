import * as path from 'path';
import { AnyOptionConfig, Config, KoaApp, PluginConfig } from '../type';
import { getDirPaths } from '../util';
import { getPathFromPlugin } from './utils';

/**
 * controller inject
 *
 * @export
 * @param {PluginConfig} plugin
 * @param {KoaApp} koaApp
 */
export default function LoadPluginControllers(
  plugin: PluginConfig,
  koaApp: KoaApp,
  config: Config,
  callback: Function | undefined,
) {
  const { pluginDir, pluginSrc, pluginPkg } = getPathFromPlugin(plugin);

  // get all plugin middleware files
  // then mount to koaApp.context
  const middlewares = getDirPaths(path.join(pluginSrc, './middleware')) || [];
  const controllers = getDirPaths(path.join(pluginSrc, './controller')) || [];

  if (!controllers.length && !middlewares.length) {
    return;
  }

  if (!controllers.length && middlewares.length) {
    callback(middlewares);
    return;
  }

  // controllers
  let routePrefix: string = '';
  let isDefinition: boolean = false;

  let pluginRoutingControllersConfig = config[plugin.name] || koaApp.context.config[plugin.name] || {};

  if (pluginRoutingControllersConfig) {
    isDefinition = typeof pluginRoutingControllersConfig.routePrefix === 'string';
    routePrefix = pluginRoutingControllersConfig.routePrefix || '';
  }

  if (!isDefinition) {
    try {
      const pluginPackageJson: AnyOptionConfig = require(pluginPkg);
      routePrefix = getPluginName(pluginPackageJson.name || pluginDir);
    } catch (err: any) {
      // do nothing
    }
  }

  const currentUserChecker = (action: any): Promise<any> => action.context.state.payload;

  pluginRoutingControllersConfig = {
    defaultErrorHandler: false,
    currentUserChecker,
    ...pluginRoutingControllersConfig,
    routePrefix,
    controllers,
  };

  callback(middlewares, pluginRoutingControllersConfig);
}

/**
 * get package name
 *
 * @param {string} packagename
 */
function getPluginName(packagename: string): string {
  const arr = packagename.split('/');
  return arr[arr.length - 1] || '';
}
