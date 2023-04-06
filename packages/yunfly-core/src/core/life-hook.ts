import * as fs from 'fs';
import * as path from 'path';
import { performance } from 'perf_hooks';
import logger from '@yunflyjs/loggers';
import { AnyOptionConfig, AppLifeHook } from '../type';
import { getFramworkDirs, isProduction } from '../util';

const appLifeHooks: AppLifeHook[] = [
  AppLifeHook.beforeStart,
  AppLifeHook.configDidReady,
  AppLifeHook.appDidReady,
  AppLifeHook.afterStart,
];

// get lifehook obj
const APPLIFEHOOK = getAppLifeHook();

/**
 * check if the function has app life hook
 *
 */
function hasAppLifeHook(fn: Function): boolean {
  if (typeof fn !== 'function' || typeof fn.prototype !== 'object') {
    return false;
  }
  for (let i = 0; i < appLifeHooks.length; i++) {
    const appLifeHook = appLifeHooks[i];
    if (typeof fn.prototype[appLifeHook] === 'function') {
      return true;
    }
  }
  return false;
}

/**
 * app life hook
 *
 */
export default function getAppLifeHook(): any[] {
  const beginTime = performance.now();
  const projectLifeHookFile = path.join(
    process.cwd(),
    isProduction() ? 'build/app.js' : 'src/app.ts',
  );
  const frameworkdirs = (getFramworkDirs() || []).map(
    (filepath: string) => `${filepath}/build/app.js`,
  );
  const result: any[] = [];
  [projectLifeHookFile, ...frameworkdirs].forEach((file: string): void => {
    if (fs.existsSync(file)) {
      try {
        const appLifeHook = require(file).default;
        if (hasAppLifeHook(appLifeHook)) {
          result.unshift(new appLifeHook());
        }
      } catch (err) {
        logger.window().error({
          msg: 'init app life hook error.',
          error: err,
        });
      }
    }
  });
  logger.color('#e5e517').window().info(`执行获取生命周期函数耗时：${(performance.now() - beginTime).toFixed(2)} ms`);
  return result;
}

/**
 * beforeStart life hook
 *
 */
export function beforeStartLifeHook(config: AnyOptionConfig): void {
  APPLIFEHOOK.forEach((item: any) => {
    if (item.beforeStart && typeof item.beforeStart === 'function') {
      item.beforeStart(config);
    }
  });
}

/**
 * configDidReady life hook
 *
 */
export function configDidReadyLifeHook(config: AnyOptionConfig): void {
  APPLIFEHOOK.forEach((item: any) => {
    if (item.configDidReady && typeof item.configDidReady === 'function') {
      item.configDidReady(config);
    }
  });
}

/**
 * afterStart life hook
 *
 */
export function afterStartLifeHook(config: AnyOptionConfig, app?: any, server?: any): void {
  APPLIFEHOOK.forEach((item: any) => {
    if (item.afterStart && typeof item.afterStart === 'function') {
      item.afterStart(config, app, server);
    }
  });
}

/**
 * appDidReady life hook
 *
 */
export function appDidReadyLifeHook(config: AnyOptionConfig, app?: any): void {
  APPLIFEHOOK.forEach((item: any) => {
    if (item.appDidReady && typeof item.appDidReady === 'function') {
      item.appDidReady(config, app);
    }
  });
}
