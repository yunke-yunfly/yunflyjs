import Schedule from '../schedule/index';
import { Config, KoaApp, PluginConfig } from '../type';
import { getPathFromPlugin } from './utils';

/**
 * schedules
 *
 * @export
 * @param {PluginConfig} plugin
 * @param {KoaApp} app
 * @param {Config} config
 */
export default function LoadPluginSchedule(plugin: PluginConfig, koaApp: KoaApp, config: Config) {
  const { pluginSrc } = getPathFromPlugin(plugin);
  // the schedule dir
  const PLUGIN_SCHEDULE_DIR = `${pluginSrc}/schedule`;
  // init schedule
  new Schedule({ config, app: koaApp, dir: PLUGIN_SCHEDULE_DIR }).ready();
}
