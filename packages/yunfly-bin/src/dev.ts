import * as path from 'path';
import { getRuningFile, sleep } from './util';
const spawn = require('cross-spawn');
const processCwd = process.cwd();

/**
 * runing srcipt dev
 *
 * @class Runing
 */
export default class Runing {
  options: any;
  config: any;

  constructor() {
    this.options = {};
    this.config = {};
  }

  /**
   * init options
   *
   * @param {*} options
   * @memberof Runing
   */
  init(options: any) {
    this.options = options || {};
    process.env.YUNFLY_WATCH = options.watch ? '1' : '0';
    this.getConfigForChildProcess();
  }

  /**
   * get yunfly configs from child_process
   *
   * @memberof Runing
   */
  getConfigForChildProcess() {
    // 通过子进程方式获取config配置
    const child = spawn(
      'ts-node',
      [require('path').join(__dirname, './getConfig')],
      { stdio: ['ipc', 'pipe', 'pipe'] },
    );

    let start: any = null;

    const timer = setTimeout(() => {
      start = true;
      this.runingScript();
    }, 6000);

    child.on('message', (msg: any = {}) => {
      const { action, data } = msg;
      if (action === 'get-config' && !start) {
        clearTimeout(timer);
        this.config = data || {};
        this.runingScript();
      }
    });

    // 为了保证子进程能运行完成，这里延迟3秒再关闭当前进程
    sleep(6000);
  }

  /**
   * runingScript
   *
   * @memberof Runing
   */
  runingScript() {
    process.env.TS_NODE_FILES = 'true';

    const { cluster } = this.config;

    // 直接启动
    if (!this.options.watch) {
      this.defaultStart();
      return;
    }

    if (cluster && cluster.enable) {
      this.clusterWatchStart();
    } else {
      this.defaultWatchStart();
    }
  }

  /**
   * 默认不监听
   *
   * @memberof Runing
   */
  defaultStart() {
    spawn.sync(
      'node',
      ['-r', 'ts-node/register', '--trace-warnings', getRuningFile()],
      { stdio: 'inherit' },
    );
  }

  /**
   * cluster 模式下的监听热重启
   *
   * @memberof Runing
   */
  clusterWatchStart() {
    spawn.sync(
      'node',
      ['-r', 'ts-node/register', '--trace-warnings', getRuningFile()],
      { stdio: 'inherit' },
    );
  }

  /**
   * 非cluster模式使用nodemon热重启
   *
   * @memberof Runing
   */
  defaultWatchStart() {
    const TsNodeDevBin = path.resolve(
      processCwd,
      './node_modules/@yunflyjs/ts-node-dev/lib/bin',
    );
    const watchDir = path.resolve(processCwd, './src');
    spawn.sync(
      'node',
      [TsNodeDevBin, `--watch=${watchDir}`, getRuningFile()],
      {
        stdio: 'inherit',
        cwd: processCwd,
        env: {
          ...process.env,
        },
      },
    );
  }
}
