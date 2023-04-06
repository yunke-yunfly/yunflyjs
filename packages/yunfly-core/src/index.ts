/**
 * use script run app
 * time 2020.11.25
 * author wangw19@mingyuanyun.com
 */
import { performance } from 'perf_hooks';
import logger from '@yunflyjs/loggers';
import getConfig from './config';
import { beforeStartLifeHook } from './core/life-hook';
import { beforeStartPluginHook } from './core/plugin-hook';
import FlyApp from './script/index';
import { initProcessEnv, processLog } from './util';

const beginTime = performance.now();
const config = getConfig({ type: 1 });
logger.color('#e5e517').window().info(`获取所有 config 配置耗时：${(performance.now() - beginTime).toFixed(2)} ms`);
const beginTime1 = performance.now();
beforeStartLifeHook(config);
beforeStartPluginHook(config)
  .then(() => {
    logger.color('#e5e517').window().info(`所有 beforeStart 生命周期 plugin 初始化成功,耗时：${(performance.now() - beginTime1).toFixed(2)} ms`);
    // Start app in script.
    new FlyApp().start();
  })
  .catch((err: any) => {
    logger.window().error({
      msg: 'start app error',
      error: err,
    });
  });

// init envs
initProcessEnv(config);
// process watch
processLog();
