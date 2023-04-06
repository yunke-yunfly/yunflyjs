import { performance } from 'perf_hooks';
import * as _ from 'lodash';
import logger from '@yunflyjs/loggers';
import { DEFAULT_PLUGIN_CONFIG } from '../const';
import { LoaderOption, PluginConfig } from '../loader/types';
import { Config, KoaApp } from '../type';
import { deepMerge, getFramworkDirs } from '../util';
import getPluginConfig from './config';
import loadPluginControllers from './controllers';
import loadPluginSchedule from './schedule';
import { getPathFromPlugin, mergePlugins } from './utils';

const plugined: string[] = [];

/**
 * load plugins
 *
 * @export
 * @class Plugin
 */
export default class Plugin {
  koaApp: KoaApp;
  config: Config;
  plugins: PluginConfig[];
  yunflyApp: Yunfly.YunflyAppConfig;
  callback: Function | undefined;
  lifeHook: string;

  constructor(option: LoaderOption) {
    this.koaApp = option.koaApp;
    this.config = option.config;
    this.yunflyApp = option.yunflyApp;
    this.callback = option.callback;
    this.lifeHook = option.lifeHook || 'appDidReady';
    this.plugins = [];
  }

  /**
   * 初始化
   *
   * @memberof Plugin
   */
  async init() {
    this.gitPluginConfig();
    this.getLifeHookPluginConfig();
    if (!this.plugins.length) {
      return;
    }
    this.sortPlugin();
    this.checkPlugin();
    await this.initPlugin();
  }

  /**
   * 获得plugin插件信息
   *
   * @returns
   * @memberof Loader
   */
  gitPluginConfig() {
    // 框架默认插件配置
    const framworkDirs: string[] = getFramworkDirs();
    if (framworkDirs.length) {
      framworkDirs.reverse().forEach((framworkDir) => {
        try {
          const plugins = require(`${framworkDir}/build/config/config.plugin`).default;
          this.plugins = mergePlugins(this.plugins, plugins);
        } catch (err: any) {
          if ((err.details || err.message).indexOf('Cannot find') > -1) {
            // do nothing
          } else {
            throw err;
          }
        }
      });
    }

    try {
      const plugins = require(DEFAULT_PLUGIN_CONFIG).default;
      if (!plugins || !plugins.length) {
        return;
      }
      this.plugins = mergePlugins(this.plugins, plugins);
    } catch (err: any) {
      if ((err.details || err.message).indexOf('Cannot find') > -1) {
        logger.window().info('没有配置config.plugin.ts配置文件(可忽略配置)。');
      } else {
        throw err;
      }
    }
  }

  /**
   * 获取当前生命周期的插件列表
   *
   * @memberof Plugin
   */
  getLifeHookPluginConfig() {
    this.plugins = this.plugins.reduce(
      (prev: PluginConfig[], next: PluginConfig) =>
        ((next.lifeHook || 'appDidReady') === this.lifeHook ? [...prev, next] : prev),
      [],
    );
  }

  /**
   * 插件排序
   * 数字越小约排前
   *
   * @memberof Plugin
   */
  sortPlugin() {
    this.plugins = this.plugins.sort(
      (a: PluginConfig, b: PluginConfig) =>
        ((a?.priority as number) || 50) - ((b?.priority as number) || 50),
    );
  }

  /**
   * plugin 数据格式校验
   *
   * @returns
   * @memberof Loader
   */
  checkPlugin() {
    if (!this.plugins.length) {
      return;
    }
    this.plugins.forEach((item: PluginConfig) => {
      if (!item.name) {
        throw new Error(`${item.package || item.path || ''}插件的name字段不能为空!`);
      }
      if (!item.package && !item.path) {
        throw new Error(`${item.name}插件package和path字段必须有一项为真!`);
      }
    });
  }

  /**
   * 初始化plugin
   *
   * @returns
   * @memberof Plugin
   */
  async initPlugin() {
    if (!this.plugins.length) {
      return;
    }
    let index: number = 0;
    while (index < this.plugins.length) {
      const beginTime = performance.now();
      const item: any = this.plugins[index] || {};
      // if (!plugined.includes((item.path || item.package) as string)) {
      //   logger.color('#008000').window().info(`初始化 ${item.path || item.package} 插件`);
      // }
      // 初始化插件config
      this.getPluginConfig(item);
      // 加载插件
      item['async'] ? await this.loadPlugin(item) : this.loadPlugin(item);
      if (this.lifeHook === 'appDidReady') {
        // 初始化controllers
        this.loadPluginControllers(item);
      }
      // 初始化定时任务
      this.loadPluginSchedule(item);
      const duration = performance.now() - beginTime;
      if (!plugined.includes((item.path || item.package) as string)) {
        logger.color('#008000').window().info(`初始化 ${item.path || item.package} 插件成功, 耗时：${duration.toFixed(2)} ms`);
      }
      plugined.push((item.path || item.package) as string);
      index++;
    }
  }

  /**
   * config merge
   *
   * @param {PluginConfig} plugin
   * @memberof Plugin
   */
  getPluginConfig(plugin: PluginConfig) {
    const config = getPluginConfig(plugin, this.config.apolloConfig);
    if (config) {
      this.config = deepMerge(config, this.config);
      if (this.koaApp.context) {
        this.koaApp.context.config = deepMerge(this.config, this.koaApp.context.config);
      }
    }
  }

  /**
   * inject controller
   *
   * @param {PluginConfig} plugin
   * @memberof Plugin
   */
  loadPluginControllers(plugin: PluginConfig) {
    loadPluginControllers(plugin, this.koaApp, this.config, this.callback);
  }

  /**
   * init schedules
   *
   * @param {PluginConfig} plugin
   * @memberof Plugin
   */
  loadPluginSchedule(plugin: PluginConfig) {
    loadPluginSchedule(plugin, this.koaApp, this.config);
  }

  /**
   * load plugin
   *
   * @param {PluginConfig} plugin
   * @returns
   * @memberof Plugin
   */
  async loadPlugin(plugin: PluginConfig) {
    const { pluginSrc } = getPathFromPlugin(plugin);
    const appfile = `${pluginSrc}/app`;
    try {
      const fn = require(appfile).default;
      if (typeof fn !== 'function') {
        logger.color('#ff0000').window().error(`${appfile}插件必须导出为函数!`);
        return;
      }

      const apolloConfig =
        this.config.apolloConfig ||
        new Proxy(
          {},
          {
            get: function (): any {
              return '';
            },
          },
        );

      // init plugin app.js
      return await fn({
        app: this.yunflyApp,
        koaApp: this.koaApp,
        pluginConfig: this.config[plugin.name] || {},
        plugin,
        config: this.config,
        apolloConfig,
      });
    } catch (err: any) {
      if (/Cannot find.+plugin.+app/.test(err.details || err.message)) {
        logger.window().info(`${appfile} 插件缺少了app.ts文件(可忽略文件)`);
      } else {
        throw err;
      }
    }
  }
}
