import * as types from "./types";
import { getTime, logger } from "./utils/util";

const util = require('util');
const EventEmitter = require('events');
const childprocess = require('child_process');


export default class Alone extends EventEmitter {
  options: types.AnyOptions;


  constructor(options: types.AnyOptions) {
    super()

    this.options = options
    this.aloneWorkerIndex = this.options.aloneWorkerIndex || 0
    this.app = null
  }


  /**
   * start alone childs process
   *
   * @param {*} app
   * @memberof Alone
   */
  startAlone(app: any) {
    this.app = app;
    this.aloneStartTime = Date.now();
    const args = [JSON.stringify(this.options)];
    const opt = {
      // stdio: ['ipc', 'pipe', 'pipe'],
      env: this.options.env || process.env
    }
    const aloneWorker = childprocess.fork(this.options.alone, args, opt);
    aloneWorker.status = 'starting';
    aloneWorker.id = ++this.aloneWorkerIndex;
    this.app.aloneWorkerIndex = aloneWorker.id;
    this.aloneWorker = aloneWorker

    logger({
      level: 'log',
      color: 'green',
      log: util.format('[%s] [master] new alone worker [alone_id: %s, alone_process_id: %s] start, state: %s',
        getTime(), aloneWorker.id, aloneWorker.pid, aloneWorker.status)
    })

    // on message
    aloneWorker.on('message', this.onMessage.bind(this))
    // on error
    aloneWorker.on('error', this.onError.bind(this))
    // on exit
    aloneWorker.once('exit', this.onExit.bind(this))


    // add worker
    this.app.emit('add-alone-worker', {
      action: 'add-alone-worker',
      from: 'alone',
      to: 'app',
      data: aloneWorker
    })

    return this;
  }


  /**
   * accept msg from app
   *
   * @param {*} msg
   * @memberof Alone
   */
  onMessage(msg: types.AnyOptions) {
    // logger({
    //   level: 'log',
    //   color: 'white',
    //   log: util.format('[%s] alone worker recived msg, msg: %s',
    //     getTime(), msg)
    // })

    // message forwarding
    const { from, to, action } = msg || {}

    if (from === 'alone' && to === 'app' && action === 'alone-worker-ready') {
      this.app.emit('alone-worker-ready', msg)
    }
    // message forwarding to app
    else if (from === 'alone' && to === 'worker') {
      this.app.emit('from-alone-to-worker', msg);
    }

  }


  /**
   * error
   *
   * @param {*} err
   * @memberof Alone
   */
  onError(err: any) {
    err.name = 'AgentWorkerError';
    err.id = this.aloneWorker.id;
    err.pid = this.aloneWorker.pid;
    logger({
      level: 'error',
      color: 'red',
      log: util.format('[%s] alone worker error, msg: %s',
        getTime(), err)
    })
  }


  /**
   * alone worker exit
   *
   * @param {number} code
   * @param {string} signal
   * @memberof Alone
   */
  onExit(code: number, signal: string) {
    this.app.emit('alone-worker-exit', {
      action: 'alone-worker-exit',
      from: 'alone',
      to: 'app',
      data: {
        code,
        signal
      }
    })
  }



}