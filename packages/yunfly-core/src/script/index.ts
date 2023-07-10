/**
 * This is a startup script for flyapp.
 */
import * as path from 'path';
import logger from '@yunflyjs/loggers';
import getConfig from '../config';
import { afterStartLifeHook } from '../core/life-hook';
import Watch from '../development/watch';
import { stop } from '../stop';
import { AnyOptionConfig, Config, YunFlyOptions } from '../type';
import { getClusterEnvs, getCpusLength, getYunflyPackageJson, isProduction } from '../util';

/**
 *
 *
 * @export
 * @class FlyApp
 */
export default class FlyApp {
  yunflyPackageJson: AnyOptionConfig;
  // env configs
  config: Config;
  reloadTimer: any;
  port: number | string;
  cluster: any;
  options: YunFlyOptions;
  // Execution stack supports chain call
  stuck: any[];
  isWatch: boolean;
  isProduction: boolean;
  callback: any;

  constructor(options?: YunFlyOptions) {
    this.options = options || {};
    this.yunflyPackageJson = getYunflyPackageJson();
    this.config = getConfig({ type: 2 });
    this.stuck = [];
    this.reloadTimer = null;
    this.port = '';
    this.isWatch = process.env.YUNFLY_WATCH === '1';
    this.cluster = null;
    this.isProduction = isProduction();
    this.callback;
  }

  /**
   * init koa app
   *
   * @returns {*}
   * @memberof FlyApp
   */
  start(fn?: Function): any {
    this.runingApp({ port: process.env.PORT || this.config.port || 9000 });
    if (fn) {
      this.callback = fn;
    }
    return this;
  }

  /**
   * run app
   *
   * @param {IServiceConfig} config
   * @memberof FlyApp
   */
  async runingApp(config: AnyOptionConfig): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    this.port = config.port;
    await stop(this.port as number);
    if (this.config.cluster && this.config.cluster?.enable && !process.env.YUNFLY_UNIT_TEST) {
      const startCluster = require('@yunflyjs/yunfly-cluster').default;
      // start app in cluster mode
      this.config.cluster.port = config.port;
      const useAloneWorker = typeof (this.config.cluster.useAloneWorker) === 'boolean' ? this.config.cluster.useAloneWorker : false;
      // worker count
      this.config.cluster.count = getCpusLength(this.config.cluster.count);
      this.config.cluster.env = getClusterEnvs(this.config.cluster.env);
      this.config.cluster.isWatch = this.isWatch;
      const args = this.config.cluster.args ?? [];
      delete this.config.cluster.args;

      _this.cluster = startCluster(
        {
          exec: path.resolve(__dirname, './run_worker'),
          alone: useAloneWorker ? path.resolve(__dirname, './run_alone') : '',
          args: [JSON.stringify(this.config.cluster), ...args],
          yunflyVerfion: this.yunflyPackageJson.version,
          port: config.port,
          ...this.config.cluster,
        },
        function () {
          _this.afterAppStartHook(_this.config);
        },
      );

      // cluster development restart
      if (!this.isProduction && this.isWatch) {
        _this.watching.call(_this);
      }
    } else {
      // start app in default mode
      const InitApp = require('./app').default;
      new InitApp({ port: config.port }).ready((config_: Config, app: any, server: any) => {
        this.afterAppStartHook(this.config, app, server);
      });
    }
  }

  /**
   * afterStart life hook
   *
   * @memberof FlyApp
   */
  afterAppStartHook(config: Config, app?: any, server?: any): void {

    process.env.RUN_BEGIN_TIME
      ? logger.window().info(`yunfly app is runing at http://127.0.0.1:${this.port}. duration time: ${(Date.now() - parseInt(process.env.RUN_BEGIN_TIME)) / 1000}s.`)
      : logger.window().info(`yunfly app is runing at http://127.0.0.1:${this.port}.`);

    // life hook
    afterStartLifeHook(config, app, server);
    this.callback && this.callback(config, app, server);
  }

  /**
   * watch file change
   *
   * @memberof FlyApp
   */
  watching(): void {
    const watch = new Watch();
    watch?.setMaxListeners(20);
    // watch file change
    watch.init();
    // reload-worker
    watch.on('reload-app-worker', this.reloadAppWorker.bind(this));
    // reload-alone
    watch.on('reload-app-alone', this.reloadAppAlone.bind(this));
  }

  /**
   * watch worker files and reload workers process
   *
   * @memberof FlyApp
   */
  reloadAppWorker(msg: AnyOptionConfig): void {
    if (msg.from !== 'app' || msg.to !== 'app') {
      return;
    }
    clearTimeout(this.reloadTimer);
    const reloadDelay = (this.config.cluster as any).reloadDelay || 600;
    this.reloadTimer = setTimeout(() => {
      this.cluster && this.cluster.reloadAppWorker();
    }, reloadDelay);
  }

  /**
   * watch alone files and reload alone process.
   *
   * @param {AnyOptionConfig} msg
   * @memberof FlyApp
   */
  reloadAppAlone(msg: AnyOptionConfig): void {
    if (msg.from !== 'app' || msg.to !== 'app') {
      return;
    }
    clearTimeout(this.reloadTimer);
    const reloadDelay = (this.config.cluster as any).reloadDelay || 300;
    this.reloadTimer = setTimeout(() => {
      this.cluster && this.cluster.reloadAppAlone();
    }, reloadDelay);
  }
}
