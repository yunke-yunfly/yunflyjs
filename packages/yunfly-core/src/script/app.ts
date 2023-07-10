import 'reflect-metadata';
import { performance } from 'perf_hooks';
import * as Koa from 'koa';
import * as _ from 'lodash';
import { getMetadataArgsStorage, useContainer, useKoaServer } from '@yunflyjs/routing-controllers';
import { Container } from 'typedi';
import logger from '@yunflyjs/loggers';
import getConfig from '../config';
import { DEFAULT_KOA_MIDDLEWARE_CONFIG } from '../const';
import { appDidReadyLifeHook } from '../core/life-hook';
import { afterStartPluginHook } from '../core/plugin-hook';
import Plugin from '../plugin/index';
import Schedule from '../schedule/index';
// types
import { AnyOptionConfig, Config, KoaApp } from '../type';
// utils
import { checkRoutingControllers, getDirPaths, processLog } from '../util';
// cluster
const cluster = require('cluster');

if (cluster.isWorker) {
  processLog();
}

/**
 *
 *
 * @export
 * @class InitApp
 */
export default class InitApp {
  app: KoaApp | any;
  callback: null | Function;
  config: Config;
  port: number;
  count: number;
  allPluginMiddlewares: string[];
  allpluginRoutingControllersConfig: any[];

  constructor(options: AnyOptionConfig) {
    this.app;
    this.callback = null;
    this.port = options.port;
    this.count = options.count || 0;
    this.allPluginMiddlewares = [];
    this.allpluginRoutingControllersConfig = [];
    this.config = getConfig({ type: 2 });
  }

  async ready(fn?: Function): Promise<any> {
    if (fn) this.callback = fn;
    // 初始化
    await this.init();
    return this;
  }

  /**
   * init
   *
   * @memberof InitApp
   */
  async init(): Promise<void> {
    this.initApp();
    this.initKoaMiddleware();
    this.appDidReady();
    const beginTime = performance.now();
    await this.plugin();
    logger.color('#e5e517').window().info(`所有 appDidReady 生命周期 plugin 初始化成功, 耗时：${(performance.now() - beginTime).toFixed(2)} ms`);
    const beginTime1 = performance.now();
    this.routingControllers();
    logger.color('#e5e517').window().info(`所有 controller 初始化成功, 耗时：${(performance.now() - beginTime1).toFixed(2)} ms`);
    this.runApp();
  }

  /**
   * create koa app service
   *
   * @memberof InitApp
   */
  initApp(): void {
    if (this.config.typedi && typeof this.config.typedi === 'function') {
      this.config.typedi(Container);
    }
    useContainer(Container);
    this.app = new Koa();
    if (this.config.cluster) {
      this.config.cluster.count = this.count;
    }
    this.app._config = this.app.config = this.config;
    // build-in config to ctx.
    this.app.context.config = this.config;
  }

  /**
   * appDidReady life hook
   *
   * @memberof InitApp
   */
  appDidReady(): void {
    appDidReadyLifeHook(this.config, this.app);
  }

  /**
   * build-in error log jwt and response middleware.
   *
   * @memberof InitApp
   */
  initKoaMiddleware(): void {
    try {
      const usekoaMiddleware = require(DEFAULT_KOA_MIDDLEWARE_CONFIG).default;
      if (usekoaMiddleware && typeof usekoaMiddleware === 'function') {
        usekoaMiddleware(this.app, this.config);
      } else {
        logger.window().error('【yunfly middleware】: config.middleware.ts配置文件必须导出一个函数。');
      }
    } catch (err: any) {
      if (/Cannot find.+config\.middleware/.test(err.details || err.message)) {
        logger.window().info('【yunfly middleware】: 没有配置config.middleware.ts配置文件(可忽略配置文件)。');
      } else {
        throw err;
      }
    }
  }

  /**
   * loader
   * load plugins
   * @memberof InitApp
   */
  async plugin(): Promise<void> {
    // init appDidReady plugins
    await new Plugin({
      koaApp: this.app as KoaApp,
      config: this.config,
      lifeHook: 'appDidReady',
      callback: (middlewares: string[] = [], pluginRoutingControllersConfig?: any) => {
        if (middlewares && middlewares.length) {
          this.allPluginMiddlewares = [...this.allPluginMiddlewares, ...middlewares];
        }
        if (pluginRoutingControllersConfig) {
          this.allpluginRoutingControllersConfig.push(pluginRoutingControllersConfig);
        }
      },
    }).init();
  }

  /**
   * routing-controllers
   *
   * @memberof InitApp
   */
  routingControllers(): void {
    const pluginConfig = _.get(this.config, 'routingControllersOptions') || {};
    let rcConfigs: any = typeof pluginConfig === 'function' ? pluginConfig() : pluginConfig;
    rcConfigs = Array.isArray(rcConfigs) ? rcConfigs : [rcConfigs];

    // ------------ 只有一个 routing-controllers 配置场景 -------------
    if (rcConfigs.length === 1 && !this.allpluginRoutingControllersConfig.length) {
      const config = rcConfigs[0];
      config.middlewares = [
        ...this.allPluginMiddlewares,
        ...(config.middlewares || []),
      ];
      checkRoutingControllers(config.controllers);
      useKoaServer(this.app, config);
      return;
    }

    // ------------ 有多个 routing-controllers 配置场景 -------------
    // 获得所有中间件文件(包含*)
    const allMiddleware = rcConfigs.reduce((prev: string[], next: AnyOptionConfig) => {
      const middlewares = next.middlewares || [];
      delete next.middlewares;
      return [...prev, ...middlewares];
    }, this.allPluginMiddlewares);

    // 获得所有中间件文件(解析*)
    const allPluginFiles = allMiddleware.reduce((prev: string[], next: string) => {
      return typeof next === 'string'
        ? (next.indexOf('/*') > -1 ? [...prev, ...(getDirPaths(next) || [])] : [...prev, next])
        : prev;
    }, []);

    // 魔法操作：require 所有中间件文件 获得 Metadata Storage对象
    allPluginFiles.forEach((item: string) => { try { require(item); } catch (err) { /* do nothing */ } });

    // 缓存初始化全局middleware
    const allGlobalMiddleware = getMetadataArgsStorage().middlewares || [];

    // 中间件分类
    const allGlobalMiddleType = allGlobalMiddleware.reduce((prev: any, next: any) => {
      next.type === 'after'
        ? prev.after.push(next)
        : prev.before.push(next);
      return prev;
    }, { before: [], after: [] });

    // 合并插件 routing-controllers 配置
    rcConfigs = [...rcConfigs, ...this.allpluginRoutingControllersConfig];

    rcConfigs.forEach((rcConfig: AnyOptionConfig, index: number) => {
      const storage = getMetadataArgsStorage();
      storage.reset();

      if (index === 0) {
        // 第一个加载 before 中间件
        storage.middlewares = allGlobalMiddleType.before;
      }
      else if (index === rcConfigs.length - 1) {
        // 最后一个加载 after 中间件
        storage.middlewares = allGlobalMiddleType.after;
      }
      checkRoutingControllers(rcConfig.controllers);
      useKoaServer(this.app, rcConfig);
    });
  }

  /**
   * run koa app service
   *
   * @memberof InitApp
   */
  runApp(): void {
    // start koa app
    const server = this.app.listen(process.env.YUNFLY_UNIT_TEST ? 0 : this.port);
    // 不限制监听连接数
    server?.setMaxListeners(10);
    // init schedule
    new Schedule({ config: this.config, app: this.app }).ready();
    // afterStart
    this.callback && this.callback(this.config, this.app, server);
    // init after plugins
    afterStartPluginHook(this.app, this.config, server);
  }
}
