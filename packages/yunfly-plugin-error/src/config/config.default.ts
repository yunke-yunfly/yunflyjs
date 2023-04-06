import { Config } from '@yunflyjs/yunfly-core';
import logger from '@yunflyjs/loggers';

/**
 * 包内置默认配置项
 *
 * @export
 * @param {KoaApp} app
 * @returns
 */
export default function config(): Config {
  const config: Config = {};

  // error 处理
  config.error = {
    enable: true,
    useYunflyLog: true,
    errCode: 2,
    showMessageDetail: false,
    useRpcErrorMessage: true,
    enableHttpCode: false,
    unhandledRejection: (err: any) => {
      logger.window().error({
        msg: `unhandledRejection error, at time, ${Date.now()}`,
        error: err,
      });
    },
    uncaughtException: (err: any) => {
      logger.window().error({
        msg: `uncaughtException error, at time', ${Date.now()}`,
        error: err,
      });
    },
  };

  return config;
}
