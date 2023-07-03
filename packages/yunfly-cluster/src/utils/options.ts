import { AnyOptions, TypeMaster } from "../types"
import * as utils from './util'


/**
 * 处理入参
 *
 * @export
 * @param {TypeMaster} options
 * @return {*}  {AnyOptions}
 */
export default function getOptions(options: TypeMaster): AnyOptions {
    const isProduction = utils.isProduction();

    if (!options.exec) {
        throw Error('[@yunflyjs/yunfly-cluster] BFF集群模式下，入参exec不能为空!')
    }

    if (!options.port) {
        throw Error('[@yunflyjs/yunfly-cluster] BFF集群模式下，入参port端口号不能为空!')
    }

    const count = options.count || require('os').cpus().length
    const isTestMode = options.mode === 'test'
    const refork = options.isWatch ? false : (isTestMode ? (options.refork || false) : (isProduction ? true : false))

    const newOptions: AnyOptions = {
        exec: options.exec,
        alone: options.alone || '',
        slaves: options.slaves || '',
        count: isTestMode ? count : (isProduction ? count : 1),
        args: options.args,
        refork,
        limit: options.limit || 60,
        duration: options.duration || 60,
        autoCoverage: false,
        env: options.env || process.env,
        windowsHide: options.windowsHide || false,
        port: options.port * 1,
        https: options.https || false,
        address: options.address || '',
        title: options.title || '',
        yunflyVerfion: options.yunflyVerfion || '0.0.0',
        isWatch: options.isWatch,
    }

    newOptions.env.YUNFLY_CLUSTER_WORKER_FILE = options.exec;
    if (options.alone) { newOptions.env.YUNFLY_CLUSTER_ALONE_FILE = options.alone; }

    return newOptions
}