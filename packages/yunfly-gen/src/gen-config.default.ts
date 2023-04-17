import chalk from "chalk";
import { Option } from './type'
const fs = require('fs-extra');


export default function genConfig(option: Option) {
  const { outputDir } = option;
  const code = `/**
 * This is an env aggregation default config.
 * (note) this is a minimum config.
*/
import * as path from 'path';
import { Config } from '@yunflyjs/yunfly';

const config = () => {
  const config: Config = {};

  /*
  * routing-controllers configs
  * 1. controllers、middlewares、authorizationChecker 需要使用path.join进行文件位置的绝对定位
  * 2. 如果 middlewares 、authorizationChecker中有rpc请求，则需要使用函数包裹。
  */
  config.routingControllersOptions = {
    defaultErrorHandler: false,
    controllers: [path.join(__dirname, '../controller/*')],
    middlewares: [path.join(__dirname, '../middleware/*')],
    // middlewares: [
    //   require(path.join(__dirname,'../middleware/xxxMiddleware')).default,
    // ]
    defaults: {
      nullResultCode: 200,  // 204 | 404
      undefinedResultCode: 200 // 204 | 404
    }
  };

  return config;
};

export default config;
`;

  fs.outputFileSync(`${outputDir}/src/config/config.default.ts`, code);
  console.info(chalk.green('generate src/config/config.default.ts file success.'))
}

