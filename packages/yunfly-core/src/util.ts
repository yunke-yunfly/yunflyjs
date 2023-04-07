import * as path from 'path';
import logger from '@yunflyjs/loggers';

import { AnyOptionConfig, Config } from './type';

const fs = require('fs');
const deepmerge = require('deepmerge');

process.env.YUNFLY_VERSION = getYunflyPackageJson().version;

// BFF运行环境 test | release | prod
export const YUNKE_ENV = (process.env.YUNKE_ENV || 'local').replace(/.*[_-]/, '');
export const NODE_ENV = process.env.NODE_ENV || 'production';

// BFF运行目录
export const ENV_SRC = NODE_ENV === 'production' ? '/build' : '/src';

/**
 * is production
 *
 * @export
 * @return {*}  {boolean}
 */
export function isProduction(): boolean {
  return (NODE_ENV === 'production') as boolean;
}

/**
 * 深度合并两个对象
 *
 * @param {AnyOptionConfig} obj1
 * @param {AnyOptionConfig} obj2
 * @returns {AnyOptionConfig}
 */
export const deepMerge = (obj1: AnyOptionConfig, obj2: AnyOptionConfig): any => {
  const overwriteMerge = (destinationArray: any[], sourceArray: any[]) => {
    const destinationArray_ = destinationArray.map((item) =>
      (typeof item === 'string' ? item.replace(/\\/g, '/') : item),
    );
    const sourceArray_ = sourceArray.map((item) =>
      (typeof item === 'string' ? item.replace(/\\/g, '/') : item),
    );
    return [...new Set([...destinationArray_, ...sourceArray_])];
  };
  return deepmerge(obj1, obj2, { arrayMerge: overwriteMerge });
};

/**
 * init envs
 *
 * @param {Config} config
 */
export const initProcessEnv = (config: Config) => {
  const { stringifyLog4js = false, consoleOutput = false } = config.log || {};
  const { enable = true } = config.log4js || {};

  process.env.DISABLE_LOG4JS = enable ? '' : 'true';
  if (!process.env.STRINGIFY_LOG4JS && stringifyLog4js) {
    process.env.STRINGIFY_LOG4JS = 'true';
  } else {
    process.env.STRINGIFY_LOG4JS = 'false';
  }
  if (!process.env.CONSOLE_OUTPUT && consoleOutput) {
    process.env.CONSOLE_OUTPUT = 'true';
  } else {
    process.env.CONSOLE_OUTPUT = 'false';
  }
};

/**
 * get envs
 *
 */
export const getClusterEnvs = (env?: AnyOptionConfig): AnyOptionConfig => (env ? env : process.env);

/**
 * package json
 *
 * @export
 * @return {*}
 */
export function getPackageJson(): any {
  return require(path.join(process.cwd(), './package.json'));
}

/**
 * get cpus length
 *
 * @return {*}  {number}
 */
export const getCpusLength = (count?: number): number => {
  const isProd = isProduction();
  if (!count) {
    count = isProd ? 4 : 1;
  }
  if (!isProd) {
    return count;
  }

  const cfsQuotaUsPath = '/sys/fs/cgroup/cpu/cpu.cfs_quota_us';
  const cpuCfsPeriodUsPath = '/sys/fs/cgroup/cpu/cpu.cfs_period_us';
  const cpuMax = '/sys/fs/cgroup/cpu.max';

  if (fs.existsSync(cfsQuotaUsPath) && fs.existsSync(cpuCfsPeriodUsPath)) {
    const cfs_quota_us = fs.readFileSync(cfsQuotaUsPath).toString().trim();
    const cfs_period_us = fs.readFileSync(cpuCfsPeriodUsPath).toString().trim();
    const cpusLength = parseInt(cfs_quota_us / cfs_period_us as any);
    if (cpusLength > 0 && cpusLength <= 16) {
      return cpusLength;
    }
  }

  if (fs.existsSync(cpuMax)) {
    const cpu_max = fs.readFileSync(cpuMax).toString().trim();
    const cpu_max_arr = cpu_max.split(' ');
    const cpusLength = parseInt(cpu_max_arr[0] / cpu_max_arr[1] as any);
    if (cpusLength > 0 && cpusLength <= 16) {
      return cpusLength;
    }
  }
  return count;
};


/**
 * 获得某个目录下的文件列表信息
 * @param filePath
 */
export function getDirPaths(filePath: string): string[] {
  filePath = filePath.replace(/\/\*+/, '/');
  const result: string[] = [];
  const fileDisplay = (filePath: string) => {
    try {
      const files = fs.readdirSync(filePath);
      files.forEach(function (filename: string) {
        try {
          const filedir = path.join(filePath, filename);
          // 根据文件路径获取文件信息，返回一个fs.Stats对象
          const stats = fs.statSync(filedir);
          const isFile = stats.isFile();
          const isDir = stats.isDirectory();
          if (isFile && !filedir.includes('.d.')) {
            result.push(filedir);
          }
          if (isDir) {
            fileDisplay(filedir);
          }
        } catch (err: any) {
          // do nothing
        }
      });
    } catch (err: any) {
      // do nothing
    }
  };
  fileDisplay(filePath);
  return result;
}


/**
 * watch process error
 *
 * @export
 */
export function processLog() {
  process.on('warning', (err: any) => {
    logger.window().error({
      msg: 'worker process warning',
      error: err,
    });
  });
  process.on('error', (err: any) => {
    logger.window().error({
      msg: 'worker process error',
      error: err,
    });
  });
}

/**
 * get framwork dirs
 *
 * @export
 * @return {*}  {string[]}
 */
export function getFramworkDirs(): string[] {
  if (!process.env.YUNFLY_FRAMEWORK_DIR_LIST) {
    return [];
  }
  return JSON.parse(process.env.YUNFLY_FRAMEWORK_DIR_LIST) || [];
}

/**
 * yunfly package json
 *
 * @export
 * @return {*}
 */
export function getYunflyPackageJson(): any {
  if (process.env.YUNFLY_FRAMEWORK_DIR_LIST) {
    const dirlist = JSON.parse(process.env.YUNFLY_FRAMEWORK_DIR_LIST) || [];
    if (dirlist.length) {
      return require(`${dirlist[dirlist.length - 1]}/package.json`);
    }
  }
  return require(path.join(__dirname, '../package.json'));
}

/**
 * config.routingControllersOptions
 * 检查 controllers 是否为空，若为空给 warn 提示
 * @export
 * @param {string[]} controllers
 * @return {*}  {void}
 */
export function checkRoutingControllers(controllers: string[]): void {
  const log = () => {
    logger.window().color('#fd2237').warn(`
    ### Warn: 初始化项目未检测到 Controllers 文件。
    1. 检查 config.routingControllersOptions 是否配置 controllers 项;
    2. 检查项目 src/controller 文件是否为空;
    3. 检查编译后 build 文件是否存在, controller 文件是否存在;
    `);
  };
  // controllers 配置为空
  if (!controllers || !controllers.length) {
    log();
    return;
  }
  // 只有一项配置且路径是泛匹配
  if (controllers.length === 1 && controllers[0].indexOf('/*') > -1) {
    const controllerFiles = getDirPaths(controllers[0]);
    if (!controllerFiles.length) {
      log();
    }
    return;
  }
  // 所有路径都是泛匹配
  const isAllUniversalMatch = controllers.every((item: string) => item.indexOf('/*') > -1);
  if (isAllUniversalMatch) {
    const controllerFiles = [];
    controllers.forEach((item: string) => {
      controllerFiles.push(...getDirPaths(item));
    });
    if (!controllerFiles.length) {
      log();
    }
  }
}
