import { Config } from '@yunflyjs/yunfly-core';

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

    // use yunfly default error log.
    useYunflyLog: true,

    /**
     * error code
     * Type: number | true | Record<Key, Key>
     */
    errCode: true,

    // enable http state
    enableHttpCode: false,

    // enable rpc error message
    useRpcErrorMessage: true,

    // enable return rpc error message
    showMessageDetail: true,

    unhandledRejection: (err: any) => {
      console.error('UnhandledRejection error, at time', Date.now(), 'reason:', err);
    },
    uncaughtException: (err: any) => {
      console.error('uncaughtException error, at time', Date.now(), 'reason:', err);
    },
  };

  return config;
}
