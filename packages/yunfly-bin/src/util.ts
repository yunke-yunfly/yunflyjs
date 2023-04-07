import * as fs from 'fs';
import * as path from 'path';
import logger from '@yunflyjs/loggers';
const chalk = require('chalk');

/**
 * get runing file
 *
 * @return {*}
 */
export const getRuningFile = () => {
  let appFile = null;
  const buildFile = path.resolve(
    process.cwd(),
    './node_modules/@yunflyjs/yunfly-core/build/index',
  );
  try {
    const runfile = isDev() ? './src/app.ts' : './build/app.js';
    const filepath = path.join(process.cwd(), runfile);
    if (
      fs.existsSync(filepath) &&
      fs.readFileSync(filepath).toString().indexOf('new FlyApp()') > -1
    ) {
      appFile = filepath;
    }
  } catch (err) {
    // do nothing
  }

  const useFile = appFile ? appFile : buildFile;

  logger.window().log(chalk.blue('The yunfly startup file: ', useFile));

  return useFile;
};

/**
 * 是否是dev环境
 *
 * @returns
 */
export const isDev = () => {
  const nodeEnv = process.env.NODE_ENV || 'production';
  return nodeEnv === ('dev' || 'development');
};

/**
 * sleep 函数
 *
 * @param {number} [time=0]
 * @returns {Promise<boolean>}
 */
export const sleep = (time = 0): Promise<boolean> => new Promise((resolve) => {
  setTimeout(() => {
    resolve(true);
  }, time);
});

/**
 * 获取框架目录
 * @return {*}  {string}
 */
export const getFrameworkDir = (): string[] => {
  const fn = (file: string): string[] => {
    const projectPackageJson = require(file);
    const matchNpms =
      [
        ...Object.keys(projectPackageJson.devDependencies || {}),
        ...Object.keys(projectPackageJson.dependencies || {}),
      ].filter((item) => item.includes('yunfly')) || [];
    if (!matchNpms.length) {
      return [];
    }
    let res = '';
    for (let i = 0; i < matchNpms.length; i++) {
      if (
        require(path.join(
          process.cwd(),
          `./node_modules/${matchNpms[i]}/package.json`,
        )).framework === 'yunfly'
      ) {
        res = path.join(process.cwd(), `./node_modules/${matchNpms[i]}`);
        break;
      }
    }
    if (!res) {
      return [];
    }
    return [res, ...fn(`${res}/package.json`)];
  };
  const result: string[] = fn(path.join(process.cwd(), './package.json'));
  if (result.length) {
    process.env.YUNFLY_FRAMEWORK_DIR_LIST = JSON.stringify(result);
  }
  return result;
};
