import * as path from 'path';

import devRuning from './dev';
import prodRuning from './prod';
import { getFrameworkDir, isDev } from './util';

process.env.RUN_BEGIN_TIME = Date.now().toString();

const { Command } = require('commander');
const packageJson = require(path.join(process.cwd(), './package.json'));
const program = new Command();

// 框架入口查询
getFrameworkDir();

program
  .version(packageJson.version)
  .option('-w, --watch', 'yunfly watch app')
  .parse(process.argv);

const options = program.opts();

if (isDev()) {
  // developmeng
  new devRuning().init(options);
} else {
  // production
  new prodRuning().init(options);
}
