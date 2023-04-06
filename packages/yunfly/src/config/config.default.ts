import * as path from 'path';
import { Config } from '@yunflyjs/yunfly-core';

const currentUserChecker = (action: any) => action.context.state.payload;

/**
 * 包内置默认配置项
 *
 * @export
 * @param {KoaApp} app
 * @returns
 */
export default function config(): Config {
  const packageJson = require(path.join(__dirname, '../../package.json'));

  const config: Config = {};

  // 版本号
  config.version = packageJson.version;

  // routing-controllers 配置项
  config.routingControllersOptions = {
    currentUserChecker,
    defaultErrorHandler: false,
    defaults: {
      nullResultCode: 200,
      undefinedResultCode: 200,
    },
  };

  config.cluster = {
    env: {
      YUNKE_ENV: process.env.YUNKE_ENV,
      STRINGIFY_LOG4JS: process.env.STRINGIFY_LOG4JS,
      CONSOLE_OUTPUT: process.env.CONSOLE_OUTPUT,
      DISABLE_LOG4JS: process.env.DISABLE_LOG4JS,
      NODE_ENV: process.env.NODE_ENV,
      CLUSTER: process.env.CLUSTER,
      YUNFLY_WATCH: process.env.YUNFLY_WATCH,
      TS_NODE_FILES: process.env.TS_NODE_FILES,
      YUNFLY_VERSION: process.env.YUNFLY_VERSION,
      YUNFLY_FRAMEWORK_DIR_LIST: process.env.YUNFLY_FRAMEWORK_DIR_LIST,
      YUNFLY_DEBUG: process.env.YUNFLY_DEBUG,
      YUNFLY_DEBUG_TYPE: process.env.YUNFLY_DEBUG_TYPE,
    },
  };

  return config;
}
