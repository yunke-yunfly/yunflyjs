import Plugin from '../plugin';
import { Config, KoaApp } from '../type';
import { LoaderOption, PluginConfig } from './types';

export default class Loader {
  koaApp: KoaApp;
  config: Config;
  plugins: PluginConfig[];
  yunflyApp: Yunfly.YunflyAppConfig;

  constructor(option: LoaderOption) {
    this.koaApp = option.koaApp;
    this.config = option.config;
    this.yunflyApp = option.yunflyApp;
    this.plugins = [];
  }

  /**
   * init plugins
   *
   * @memberof Loader
   */
  init() {
    // 初始化plugins
    new Plugin({
      koaApp: this.koaApp,
      config: this.config,
      yunflyApp: this.yunflyApp,
    }).init();
  }
}
