import * as path from 'path';

import { ENV_SRC, YUNKE_ENV } from './util';

// package.json 配置
export const PACKAGE_JSON_CONFIG = path.join(process.cwd(), './package.json').replace(/\\/g, '//');

// bff 业务代码中 default config 配置
export const DEFAULT_DEFAULT_CONFIG = path
  .join(process.cwd(), `${ENV_SRC}/config/config.default`)
  .replace(/\\/g, '//');

//  bff 业务代码中 env config 配置
export const ENV_CONFIG = path
  .join(process.cwd(), `${ENV_SRC}/config/config.${YUNKE_ENV}`)
  .replace(/\\/g, '//');

// koa 初始化中间件 config 配置
export const DEFAULT_KOA_MIDDLEWARE_CONFIG = path
  .join(process.cwd(), `${ENV_SRC}/config/config.middleware`)
  .replace(/\\/g, '//');

// 定时任务目录
export const DEFAULT_SCHEDULE_DIR = path
  .join(process.cwd(), `${ENV_SRC}/schedule/`)
  .replace(/\\/g, '//');

// socket middleware 文件夹
export const SOCKET_MIDDLEWARE_DIR = path
  .join(process.cwd(), `${ENV_SRC}/socket/middleware/`)
  .replace(/\\/g, '//');

// socket main 函数入口
export const SOCKET_CONTROLLER_MAIN = path
  .join(process.cwd(), `${ENV_SRC}/socket/controller/MainController`)
  .replace(/\\/g, '//');

// alone 文件夹
export const DEFAULT_ALONE_DIR = path.join(process.cwd(), `${ENV_SRC}/alone/`).replace(/\\/g, '//');

// plugin 文件夹
export const DEFAULT_PLUGIN_CONFIG = path
  .join(process.cwd(), `${ENV_SRC}/config/config.plugin`)
  .replace(/\\/g, '//');
