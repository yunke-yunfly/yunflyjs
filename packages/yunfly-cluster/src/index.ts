/**
 * time 2021.3.1
 * author wangw19@mingyuanyun.com
 */

import Master from './master'
import { TypeMaster } from './types';

/**
 * start yunfly cluster
 *
 * @export
 * @param {TypeMaster} options cluster options
 * @param {() => any} callback success callback
 */
export default function startCluster(
  options: TypeMaster,
  callback: () => any
): any {
  return new Master(options).ready(callback);
}

