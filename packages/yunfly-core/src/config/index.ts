import logger from '@yunflyjs/loggers';
import { DEFAULT_DEFAULT_CONFIG, ENV_CONFIG } from '../const';
import { configDidReadyLifeHook } from '../core/life-hook';
import { ApolloConfig, Config } from '../type';
import { deepMerge, getFramworkDirs } from '../util';

// 缓存的config配置
let cacheConfig: Config = {};
let configLoadTime: number = 0;

/**
 * get configs
 *
 * @returns {{ bffDefaultConfig: any; bffEnvConfig: any; framworkConfigs: any }}
 */
function getConfigs(): { bffDefaultConfig: any; bffEnvConfig: any; framworkConfigs: any } {
  // 用户BFF默认配置
  let bffDefaultConfig: any | Function = null;
  // 配置包默认配置
  let bffEnvConfig: any | Function = null;
  // 框架默认配置
  let framworkConfigs: (any | Function)[] = [];

  try {
    bffDefaultConfig = require(DEFAULT_DEFAULT_CONFIG).default;
  } catch (err: any) {
    if (/Cannot find.+config\.default/.test(err.details || err.message)) {
      logger.window().error({
        message: '【yunfly config】: 没有配置config.default.ts配置文件(推荐配置)',
        file: DEFAULT_DEFAULT_CONFIG,
        error: err,
      });
    } else {
      throw err;
    }
  }
  try {
    bffEnvConfig = require(ENV_CONFIG).default;
  } catch (err: any) {
    if (/Cannot find.+config/.test(err.details || err.message)) {
      // logger.info(`【yunfly config】: 没有配置config.${YUNKE_ENV}.ts配置文件(可忽略配置)`);
    } else {
      throw err;
    }
  }

  // 框架默认配置
  const framworkDirs: string[] = getFramworkDirs();
  if (framworkDirs.length) {
    framworkConfigs = framworkDirs.reduce((prev: any[], next: string) => {
      try {
        return [...prev, require(`${next}/build/config/config.default`).default];
      } catch (err: any) {
        if (/Cannot find.+config/.test(err.details || err.message)) {
          return prev;
        } else {
          throw err;
        }
      }
    }, []);
  }

  return {
    bffDefaultConfig,
    bffEnvConfig,
    framworkConfigs,
  };
}

/**
 * 配置合并处理器
 *
 * @export
 * @param {{ type: number, arg: AnyOptionConfig }} { type, arg }
 * type: 1: bin脚本 2：初始化 3：传入参数
 * @return {*}  {Config}
 */
export default function getConfig(
  { type }: { type?: number } = {},
  apolloConfig?: ApolloConfig,
): Config {
  const { bffDefaultConfig, bffEnvConfig, framworkConfigs } = getConfigs();

  let config: Config = cacheConfig;
  const arg =
    config.apolloConfig ||
    apolloConfig ||
    new Proxy(
      {},
      {
        get: function (): any {
          return '';
        },
      },
    );

  if (framworkConfigs.length) {
    framworkConfigs.reverse().forEach((configFn: any) => {
      config = deepMerge(config, configFn(arg));
    });
  }

  if (bffDefaultConfig) config = deepMerge(config, bffDefaultConfig(arg));

  if (bffEnvConfig) config = deepMerge(config, bffEnvConfig(arg));

  // configDidReady life hook
  if (type === 2 && !configLoadTime) {
    configLoadTime++;
    configDidReadyLifeHook(config);
  }

  cacheConfig = config;

  return cacheConfig;
}

/**
 * set config
 *
 * @export
 * @param {Config} config
 */
export function setConfig(config: Config) {
  if (config) {
    cacheConfig = { ...cacheConfig, ...config };
  }
}
