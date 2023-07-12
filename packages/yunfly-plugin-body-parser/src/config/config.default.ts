import { Config } from '@yunflyjs/yunfly-core';
import { BodyParserConfig } from '../types';

/**
 * 包内置默认配置项
 *
 * @export
 * @param {KoaApp} app
 * @returns
 */
export default function config(): Config {
  const config: Config & { bodyParser?: BodyParserConfig } = {};

  // body参数配置
  config.bodyParser = {
    enable: true,
    jsonLimit: '5mb',
    formLimit: '5mb',
    queryString: {
      parameterLimit: 5 * 1024 * 1024,
    },
  };

  return config;
}
