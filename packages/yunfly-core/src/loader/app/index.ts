import * as _ from 'lodash';

import { getCurrentContext } from '../../core/current-context';
import { ApolloConfig, Config, KoaApp } from '../../type';
import { YunflyAppOption, YunflyPluginObj } from '../types';

/**
 * yunfly app
 *
 * @export
 * @class YunflyApp
 */
export default class YunflyApp {
  koaApp: KoaApp;
  config: Config;
  [props: string]: any;

  constructor(option: YunflyAppOption) {
    this.koaApp = option.koaApp;
    this.config = option.config;
  }

  /**
   * get apollo config
   *
   * @readonly
   * @type {ApolloConfig}
   * @memberof YunflyApp
   */
  get apolloConfig(): ApolloConfig {
    return (
      this.config.apolloConfig ||
      new Proxy(
        {},
        {
          get: function (): any {
            return '';
          },
        },
      )
    );
  }

  /**
   * return koa context
   *
   * @readonly
   * @memberof YunflyApp
   */
  get ctx() {
    return getCurrentContext();
  }

  /**
   * inject plugin to yunfly app
   *
   * @param {string} pluginName
   * @param {Function} pluginObj
   * @memberof YunflyApp
   */
  public addPlugin(pluginName: string, pluginObj: YunflyPluginObj) {
    if (typeof pluginObj === 'function') {
      this[pluginName] = pluginObj({
        koaApp: this.koaApp,
        config: this.config,
        apolloConfig: this.apolloConfig,
      });
    }
  }
}
