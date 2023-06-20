/**
 * beforeStart plugin hook
 *
 */
import Plugin from '../plugin';
import { Config, KoaApp } from '../type';

/**
 * init beforeStart plugins
 *
 * @export
 * @return {*}  {Promise<any>}
 */
export function beforeStartPluginHook(config: Config): Promise<any> {
  return new Plugin({
    koaApp: {} as KoaApp,
    config: config,
    lifeHook: 'beforeStart',
  }).init();
}

/**
 * init beforeStart plugins
 *
 * @export
 * @param {KoaApp} app
 * @param {Config} config
 * @param {Yunfly.YunflyAppConfig} yunflyApp
 * @param {Function} callback
 */
export async function appDidReadyPluginHook(
  app: KoaApp,
  config: Config,
  callback: Function,
) {
  // 初始化plugins
  return await new Plugin({
    koaApp: app,
    config: config,
    lifeHook: 'appDidReady',
    callback: callback,
  }).init();
}

/**
 * init afterStart plugins
 *
 * @export
 * @return {*}  {Promise<any>}
 */
export function afterStartPluginHook(
  app: KoaApp,
  config: Config,
  server: any,
): Promise<any> {
  return new Plugin({
    koaApp: app as KoaApp,
    config: config,
    server,
    lifeHook: 'afterStart',
  }).init();
}
