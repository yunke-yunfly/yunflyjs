import logger from '@yunflyjs/loggers';
import { SOCKET_CONTROLLER_MAIN, SOCKET_MIDDLEWARE_DIR } from '../const';
import { AnyOptionConfig, Config, KoaApp } from '../type';
import { getDirPaths } from '../util';
const cluster = require('cluster');

/**
 * socket 服务
 *
 * @export
 * @class Socket
 */
export default class Socket {
  config: AnyOptionConfig;
  server: any;

  constructor({ config, server }: { config: Config; server?: KoaApp }) {
    this.config = config;
    this.server = server;
  }

  /**
   * ready
   *
   * @memberof Socket
   */
  ready(): void {
    // run socket
    this.runSocket();
  }

  /**
   * run socket
   *
   * @param {number} [worker_pid]
   * @return {*}
   * @memberof Socket
   */
  runSocket(): void {
    if (!this.config.socket || !this.config.socket.enable) {
      return;
    }

    const type = this.config.socket.type || 'worker';
    if (type === 'worker' && cluster.isWorker) {
      cluster.worker.on('message', (msg: AnyOptionConfig) => {
        const { from, to, action } = msg || {};
        if (from === 'app' && to === 'worker' && action === 'random-select-worker') {
          this.runSocketTask();
        }
      });
    } else {
      this.runSocketTask();
    }
  }

  /**
   * run socket task
   *
   * @memberof Socket
   */
  runSocketTask(): void {
    const io = require('socket.io')(this.server, this.config.socket);

    // socket middleware
    const RunMiddleware = async (socket: any) => {
      const paths = await getDirPaths(SOCKET_MIDDLEWARE_DIR);

      if (!paths || !paths.length) {
        return;
      }

      const middlewareItemRun = (path: string) => {
        const middlewareFn = require(path).default;

        if (!middlewareFn) {
          return;
        }

        middlewareFn(socket);
      };

      paths.forEach((path: string) => {
        middlewareItemRun(path);
      });
    };

    // socket init
    const RunSocketController = (socket: any) => {
      const socketMain = require(SOCKET_CONTROLLER_MAIN).default;

      if (!socketMain || typeof socketMain !== 'function') {
        return;
      }

      socketMain(socket);
    };

    io.on('connection', (socket: any) => {
      logger.window().info('socket.io is connection!');
      // socket 中间件
      RunMiddleware(socket);

      // socket逻辑
      RunSocketController(socket);
    });
  }
}
