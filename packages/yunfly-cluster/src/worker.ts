import * as types from "./types";
import { getTime, logger } from "./utils/util";
import path from 'path';

const cluster = require('cluster');
const EventEmitter = require('events');
const cfork = require('cfork');
const util = require('util');

export default class Worker extends EventEmitter {
  options: types.AnyOptions;

  constructor(options: types.AnyOptions) {
    super(options)

    this.options = options
    this.app = null
  }

  /**
   * startWorker
   * @memberof Worker
   */
  startWorker(app: any) {
    this.app = app
    const workerFile = path.join(__dirname,'./script/run_worker');
    // fork worker
    cfork({
      exec: workerFile,
      slaves: this.options.slaves,
      count: this.options.count || require('os').cpus().length,
      args: this.options.args,
      refork: this.options.refork,
      limit: this.options.limit || 60,
      duration: this.options.duration || 60,
      autoCoverage: false,
      env: this.options.env || process.env,
      windowsHide: this.options.windowsHide || false,
    })

    // on fork
    cluster.on('fork', this.onFork.bind(this))

    // on disconnect
    cluster.on('disconnect', this.onDisconnect.bind(this))

    // on exit
    cluster.on('exit', this.onExit.bind(this))

    // on unexpectedExit
    cluster.on('unexpectedExit', this.onUnexpectedExit.bind(this));

    // on listening
    cluster.on('listening', this.onListening.bind(this));

    return this;
  }

  /**
   * fork
   * @param {*} worker
   * @memberof Worker
   */
  onFork(worker: any) {
    worker.disableRefork = true;
    // log
    logger({
      level: 'log',
      color: 'green',
      log: util.format('[%s] [master] a new worker [worker_id: %s, worker_process_id: %s] start, state: %s, current workers: %s',
        getTime(), worker.id, worker.process.pid, worker.state, Object.keys(cluster.workers))
    })

    // add worker
    this.app.emit('add-worker', {
      action: 'add-worker',
      from: 'worker',
      top: 'app',
      data: worker
    })

    // watch wroker msgs
    this.watchWorker(worker)

  }

  /**
   * disconnect
   *
   * @param {*} worker
   * @memberof Worker
   */
  onDisconnect(worker: any) {
    logger({
      level: 'warn',
      color: 'yellow',
      log: util.format(`[%s] [master: %s] [worker_process_id: %s] disconnect,exitedAfterDisconnect: %s, state: %s, current workers: %s`,
        getTime(), process.pid, worker.process.pid, worker.exitedAfterDisconnect, worker.state, Object.keys(cluster.workers))
    })
  }

  /**
   * onxit
   *
   * @param {*} worker
   * @param {number} code
   * @param {*} signal
   * @memberof Worker
   */
  onExit(worker: any, code: number, signal: any) {
    const exitCode = worker.process.exitCode;
    logger({
      level: 'error',
      color: 'yellow',
      log: util.format('[%s] [master %s] WorkerDiedError, worker %s died (code: %s, signal: %s, exitedAfterDisconnect: %s, state: %s)',
        getTime(), process.pid, worker.process.pid, exitCode, signal, worker.exitedAfterDisconnect, worker.state)
    })

    // send msg to app
    this.app.emit('worker-exit', {
      from: 'worker',
      to: 'app',
      action: 'worker-exit',
      data: {
        workerPid: worker.process.pid,
        code,
        signal,
      }
    })
  }

  /**
   * unexpectedExit
   *
   * @param {*} worker
   * @param {number} code
   * @param {*} signal
   * @memberof Worker
   */
  onUnexpectedExit(worker: any, code: number, signal: any) {
    // logger what you want
    logger({
      level: 'error',
      color: 'yellow',
      log: util.format('[%s] [master:%s], [worker_process_id: %s] is unexpected exit. state: %s, current workers: %j',
        getTime(), process.pid, worker.process.pid, worker.state, Object.keys(cluster.workers))
    })

    // send msg to app
    this.app.emit('worker-exit', {
      from: 'worker',
      to: 'app',
      action: 'worker-exit',
      data: {
        workerPid: worker.process.pid,
        code,
        signal,
      }
    })
  }

  /**
   * listening
   *
   * @param {*} worker
   * @param {*} address
   * @memberof Worker
   */
  onListening(worker: any, address: any) {
    logger({
      level: 'log',
      color: 'green',
      log: util.format(`[%s] [master] [master:%s] [worker_process_id: %s] is listening, address %s`,
        getTime(), process.pid, worker.process.pid, JSON.stringify(address))
    })

    // send msg to app
    this.app.emit('worker-start', {
      action: 'worker-start',
      from: 'worker',
      to: 'app',
      data: {
        workerPid: worker.process.pid,
        address
      }
    })
  }


  /**
   * watch worker msgs
   *
   * @param {*} worker
   * @memberof Worker
   */
  watchWorker(worker: any) {
    worker.on('message', (msg: types.AnyOptions) => {

      const { from, to } = msg || {}
      if (from === 'worker' && to === 'alone') {
        this.app.emit('from-worker-to-alone', msg)
      }
      else if (from === 'worker' && to === 'app') {
        this.app.emit('from-worker-to-app', msg)
      }
      // logger({
      //   isLog1: true,
      //   log: util.format(`[%s] worker [worker_id: %s, worker_process_id: %s] recevied msg: %s`,
      //     getTime(), worker.id, worker.process.pid, msg)
      // })
    });
  }


}