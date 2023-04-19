import { TypeGetAddress } from "../types";
import * as path from 'path'
import logger_ from '@yunflyjs/loggers';

const dayjs = require('dayjs')
const chalk = require('chalk');


// BFF运行环境 test | release | prod
export const RUNTIME_ENV = process.env.RUNTIME_ENV || 'local';
export const NODE_ENV = process.env.NODE_ENV || 'production';

// BFF运行目录
export const ENV_SRC = NODE_ENV === 'production' ? '/build' : '/src';


export const PACKAGE_JSON = path.join(
  process.cwd(),
  `./package.json`,
).replace(/\\/g, '//');


export const CLUSER_PACKAGE_JSON = path.join(
  __dirname,
  `../../package.json`,
).replace(/\\/g, '//');

/**
 * is production
 *
 * @export
 * @return {*}  {boolean}
 */
export function isProduction(): boolean {
  const nodeEnv: string = process.env.NODE_ENV || ''

  return (nodeEnv === 'production') as boolean
}


/**
 * get address
 *
 * @export
 * @param {TypeGetAddress} { address, port, protocol }
 * @return {*}  {string}
 */
export function getAddress({ address, port, protocol }: TypeGetAddress): string {

  let hostname = address;
  if (!hostname && process.env.HOST && process.env.HOST !== '0.0.0.0') {
    hostname = process.env.HOST;
  }
  if (!hostname) {
    hostname = '127.0.0.1';
  }
  return `${protocol}://${hostname}:${port}`;
}



/**
 * get format day
 *
 * @export
 * @param {*} date
 * @return {*} 
 */
export function getTime(date?: Date | string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
}


/**
 * log
 *
 * @export
 * @param {{log: string,type?: string}} options
 */
export function logger(options: { log: string, level?: string; color?: string, isLog1?: boolean }) {
  const level = options.level || 'log'
  const color = options.color || 'white'
  const log = options.log || ''
  return logger_.window().color(color)[level](log)
}



/**
 * console
 *
 * @export
 * @param {{len: number; color: string; str?: string}} {len, color, str}
 * @return {*} 
 */
export function strlog({ len, color, str }: { len: number; color?: string; str?: string }): string {
  let res: string = ''
  if (!str) {
    for (let i = 0; i < len; i++) { res = res + '─' }
    return color ? chalk[color](res) : res
  }
  str = str.toString().substr(0, len)
  const havelen = len - str.length
  res = str
  if (havelen) {
    for (let i = 0; i < havelen; i++) { res = res + ' ' }
  }
  return color ? chalk[color](res) : res
}


/**
 * random select worker
 *
 * @param {number} count
 */
export const randomWorker = (count: number): number => {
  return Math.ceil(Math.random() * count)
}
