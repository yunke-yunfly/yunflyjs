/**
 * time 2021.3.1
 * author wangw19@mingyuanyun.com
 */

import * as types from "./types";
import getOptions from "./utils/options";
import * as utils from "./utils/util";
// import Messenger from "./utils/message"
import Manager from "./utils/manager";
import Worker from './worker'
import Alone from './alone'
import { strlog as L } from "./utils/util";
import logger from '@yunflyjs/loggers';

const util = require('util');
const EventEmitter = require('events');
const cluster = require('cluster');
const detect = require('detect-port');
const sendmessage = require('sendmessage');
const pidFromPort = require('pid-from-port');
const treeKill = require('tree-kill');

const PROTOCOL = Symbol('Master#protocol');
const PORT = Symbol('Master#port');
const ADDRESS = Symbol('Master#address');

export default class Master extends EventEmitter {
  options: types.AnyOptions;
  isProduction: boolean;
  packagejson: types.AnyOptions;
  messenger: any;
  workerManager: any;
  closed: boolean;
  workerSuccessCount: number;
  isAllWorkerStarted: boolean;
  clusterReadyCallback: any;
  randomSelectWorker: { worker_id: null | string | number; worker_pid: null | string | number }


  constructor(options: types.TypeMaster) {
    super()

    this.options = getOptions(options)
    this.workerManager = new Manager(options);
    this.isProduction = utils.isProduction();

    this.isStarted = false;
    // record app close.
    this.closed = false;
    this.workerSuccessCount = 0;
    this.isAllWorkerStarted = false;
    this.clusterReadyCallback = null;
    this.aloneWorkerIndex = 0;
    this.startTime = process.env.RUN_BEGIN_TIME ? parseInt(process.env.RUN_BEGIN_TIME) : Date.now();
    // record randomly selected worker.
    // this will be useful if the worker restart.
    this.randomSelectWorker = {
      worker_id: null,
      worker_pid: null,
    };

    this[PORT as any] = this.options.port;
    this[PROTOCOL as any] = this.options.https ? 'https' : 'http';
    this[ADDRESS as any] = this.options.address ? this.options.address : '127.0.0.1'

    this.packagejson = require(utils.PACKAGE_JSON)
    this.cluserPackagejson = require(utils.CLUSER_PACKAGE_JSON)

    if (!this.options.title) {
      this.options.title = `yunfly-${this.packagejson.name}`
    }

    // port detection
    this.detectPort()

    utils.logger({
      level: 'info', color: 'blue',
      log: util.format('[%s] yunfly app begin, isProduction: %s, PROTOCOL: %s, ADDRESS: %s, PORT: %s, name: %s, is refork: %s, fire address: %s',
        utils.getTime(), this.isProduction, this[PROTOCOL as any], this[ADDRESS as any], this[PORT as any], this.packagejson.name, this.options.refork, this.options.exec)
    })

    // first step. run app.
    this.startApp()
  }


  /**
   * init start app
   *
   * @memberof Master
   */
  startApp() {
    // watching process msg.
    this.watch();

    // start app success and then start alone
    if (this.options.alone && this.options.alone.trim()) {
      this.startAloneWorker();
      return
    }

    // start cluster worker
    this.startClusterWorker();
  }


  /**
   * start cluster workers
   *
   * @memberof Master
   */
  startClusterWorker() {
    // start worker
    this.workerSuccessCount = 0;
    this.isAllWorkerStarted = false;
    const worker = new Worker(this.options).startWorker(this);
    worker?.setMaxListeners(10);
  }

  /**
   * start alone worker
   *
   * @memberof Master
   */
  startAloneWorker() {
    const options = { ...this.options, aloneWorkerIndex: this.aloneWorkerIndex };
    const alone = new Alone(options).startAlone(this);
    alone?.setMaxListeners(10);
  }


  /**
  * stop app
  *
  * @memberof Master
  */
  closeApp() {
    this.closed = true
    this.isStarted = false;
    const aliveWorkers = this.workerManager.getAliveWorkers();
    const KILL_SIGNAL = 'SIGTERM';

    // kill alone worker
    this.workerManager.deleteAlone();

    // kill other workers
    for (var i = 0; i < aliveWorkers.length; i++) {
      let worker = aliveWorkers[i];
      worker.kill(KILL_SIGNAL);
    }

    // exiting with code:1
    utils.logger({
      level: 'log', color: 'red',
      log: util.format('[%s] [app: %s], stop app and kill all workers. exiting with code:1', utils.getTime(), process.pid)
    })

    process.exit(1);
  }


  /**
   *  reload cluster workers process
   *
   * @memberof Master
   */
  reloadAppWorker() {
    this.workerSuccessCount = 0;
    this.isAllWorkerStarted = false;
    this.startTime = Date.now();
    utils.logger({
      level: 'log',
      color: 'green',
      log: '[master] reload workers...'
    })
    for (const id in cluster.workers) {
      const worker = cluster.workers[id];
      worker.isDevReload = true;
    }
    require('cluster-reload')(this.options.count);
  }


  /**
   * reload alone process
   *
   * @memberof Master
   */
  reloadAppAlone() {
    utils.logger({
      level: 'log',
      color: 'green',
      log: '[master] reload alone...'
    })

    const KILL_SIGNAL = 'SIGTERM';
    const agentWorker = this.workerManager.getAlone();
    agentWorker.kill(KILL_SIGNAL);
  }


  /**
   * yunfly cluster rady
   *
   * @param {() => any} callback
   * @memberof Master
   */
  ready(callback: () => any) {
    this.clusterReadyCallback = callback
    return this
  }


  /**
   * cluster is ready.
   * all worker and alone is started.
   * @memberof Master
   */
  yunflyClusterReady() {
    this.isStarted = true;

    // random select a worker do something.
    this.randomSelectAWorker()

    utils.logger({
      level: 'log', color: 'green',
      log: util.format('[%s] yunfly app is started. duration time: %sms, current workers: %s, worker_process_ids: %s',
        utils.getTime(), Date.now() - this.startTime, Object.keys(cluster.workers), this.workerManager.listWorkerIds())
    })

    utils.logger({
      level: 'log', color: 'magenta',
      log: util.format('[%s] app is runing success at %s://%s:%s', utils.getTime(), this[PROTOCOL as any], this[ADDRESS as any], this[PORT as any])
    })

    // shell console
    this.console();

    // ready callback
    this.clusterReadyCallback && this.clusterReadyCallback.call(this)

    // start check agent and worker status
    if (this.isProduction) {
      this.workerManager.startCheck();
    }
  }


  /**
   * watch process message and disconnect handle.
   *
   * @memberof Master
   */
  watch() {
    // watch process message
    // process.on('message', (msg: types.AnyOptions) => {
    // });

    // watch add-worker emit
    this.on('add-worker', this.onForkWorker.bind(this));
    // watch worker-exit emit
    this.on('worker-exit', this.onWokerExit.bind(this));
    // watch worker-start emit
    this.on('worker-start', this.onWorkerStart.bind(this));


    // exit when app is disconnect
    process.once('disconnect', () => {
      utils.logger({
        level: 'error', color: 'red',
        log: util.format('[%s] [app: %s] is disconnect. exiting with code:1', utils.getTime(), process.pid)
      })
      process.exit(1);
    });


    // exit when alone or worker exception
    this.workerManager.on('exception', ({ worker }: { worker: number }) => {
      const err: any = new Error(`[${utils.getTime()}] [app:${process.pid}], ${worker} worker(s) alive, exit to avoid unknown state.`);
      err.name = 'ClusterWorkerExceptionError';
      err.count = { worker };
      utils.logger({ level: 'error', color: 'red', log: err })
      process.exit(1);
    });

    // kill(2) Ctrl-C
    process.once('SIGINT', this.onSignal.bind(this, 'SIGINT'));
    // kill(3) Ctrl-\
    process.once('SIGQUIT', this.onSignal.bind(this, 'SIGQUIT'));
    // kill(15) default
    process.once('SIGTERM', this.onSignal.bind(this, 'SIGTERM'));
    // watch exit
    process.once('exit', this.onExit.bind(this));

    // watch reload-worker emit
    this.on('reload-worker', this.reloadAppWorker.bind(this));
    // watch reload-alone emit
    this.on('reload-alone', this.reloadAppAlone.bind(this))
    // watch close app emit
    this.on('close-app', this.closeApp.bind(this));
    // add new alone worker
    this.on('add-alone-worker', this.onForkAlone.bind(this));
    // alone worker exit
    this.on('alone-worker-exit', this.onAloneExit.bind(this));
    // alone worker ready
    this.on('alone-worker-ready', this.onAloneWorkerReady.bind(this));

    // receive alone msg and forwarding to woker
    this.on('from-alone-to-worker', this.onFromAloneToWorker.bind(this));
    // receive worker msg and forwarding to alone
    this.on('from-worker-to-alone', this.onFromWorkerToAlone.bind(this));
  }


  /**
   * detection prot
   *
   * @memberof Master
   */
  async detectPort() {
    try {
      const port = await detect(this[PORT as any]);
      if (this[PORT as any] !== port) {
        // get pid from port
        const res = await pidFromPort(this[PORT as any]);
        utils.logger({
          level: 'log', color: 'red',
          log: util.format('[%s] [app：%s], port: %s was occupied. kill the process and restart a new process.', utils.getTime(), process.pid, this[PORT as any])
        })
        // kill pid
        treeKill(res);
      }
    } catch (err) {
      utils.logger({
        level: 'log', color: 'red',
        log: util.format('[%s] [app], start app port error。exiting with code:1', utils.getTime())
      })
      process.exit(1);
    }
  }

  /**
   * add new worker
   *
   * @param {*} worker
   * @memberof Master
   */
  onForkWorker(msg: types.AnyOptions) {
    const { data: worker } = msg || {}
    worker._title_ = this.options.title;
    this.workerManager.setWorker(worker);
  }


  /**
   * worker exit
   *
   * @param {types.AnyOptions} data
   * @return {*} 
   * @memberof Masters
   */
  onWokerExit(msg: types.AnyOptions): void {
    if (this.closed) return;

    const { data } = msg || {}
    const worker = this.workerManager.getWorker(data.workerPid);

    // remove all listeners to avoid memory leak
    try { worker.removeAllListeners(); } catch (err) { }

    // delete dide worker
    this.workerManager.deleteWorker(data.workerPid);

    // get alive worker ids.
    const aliveWorker: number[] = this.workerManager.getListeningWorkerIds() || []

    // log
    utils.logger({
      level: 'log', color: 'green',
      log: util.format('[%s] [app] have alive worker number: %s, workers:aliveWorker ', utils.getTime(), aliveWorker.length, aliveWorker)
    })
    // worker exit counter 
    this.emit('from-alone-to-worker', { from: 'app', to: 'worker', type: 'worker', action: 'worker-process-exit-counter' })

    // reselect random worker
    if (
      this.options.isWatch ||
      (this.isProduction && this.randomSelectWorker.worker_pid === data.workerPid)
    ) {
      this.randomSelectAWorker()
    }

    if (this.isProduction) {
      // If after five seconds. The living worker is zero.  exiting with code with 1.
      setTimeout(() => {
        const aliveWorker_: number[] = this.workerManager.getListeningWorkerIds() || []
        if (aliveWorker_.length <= 0) {
          // exit if died during startup
          utils.logger({
            level: 'error', color: 'red',
            log: util.format('[%s] [app: %s],  [worker_process_id: %s] start fail.  exiting with code:1', utils.getTime(), process.pid, worker.process.pid)
          })
          process.exit(1);
        }
      }, 5000)
    }
  }


  /**
   * worker started
   *
   * @param {types.AnyOptions} data
   * @memberof Master
   */
  onWorkerStart(msg: types.AnyOptions): void {
    const { data } = msg || {}
    const worker = this.workerManager.getWorker(data.workerPid);
    worker.duration = (Date.now() - this.startTime) / 1000 + 's';
    const address = data.address;

    this.workerSuccessCount++;

    const remain = this.isAllWorkerStarted ? 0 : this.options.count - this.workerSuccessCount;

    utils.logger({
      level: 'log', color: 'blue',
      log: util.format('[%s], [app: %s], [worker_id：%s, worker_process_id: %s] address port: %s, remain worker number: %s',
        utils.getTime(), process.pid, worker.id, data.workerPid, address.port, remain)
    })

    if (remain === 0) {
      this.isAllWorkerStarted = true;
    }

    // if app is started, it should enable this worker
    if (this.isAllWorkerStarted) {
      worker.disableRefork = false;
    }

    // enable all workers when app started
    for (const id in cluster.workers) {
      const worker = cluster.workers[id];
      worker.disableRefork = false;
    }

    // Send yunfly-cluster-ready when all worker is started after launched
    if (!this.isStarted && this.isAllWorkerStarted) {
      setTimeout(() => { this.yunflyClusterReady.call(this) }, 200)
    }
    else if (this.isAllWorkerStarted) {
      // shell console
      setTimeout(() => {
        utils.logger({
          level: 'log', color: 'green',
          log: util.format('[%s] yunfly worker reload success. duration time: %sms, current workers: %s, worker_process_ids: %s',
            utils.getTime(), Date.now() - this.startTime, Object.keys(cluster.workers), this.workerManager.listWorkerIds())
        });
        this.console();
      }, 200)
    }
  }


  /**
   * handle kill sign
   *
   * @param {string} signal
   * @return {*} 
   * @memberof Master
   */
  onSignal(signal: string): any {
    if (this.closed) return;
    utils.logger({
      level: 'error', color: 'red',
      log: util.format('[%s] [app: %s] receive signal %s, closing.', utils.getTime(), process.pid, signal)
    })
    this.closeApp()
  }


  /**
   * process exit
   *
   * @memberof Master
   */
  onExit(code: number) {
    const level = code === 0 ? 'info' : 'error';
    utils.logger({
      level, color: 'red',
      log: util.format('[%s] [app: %s]. watch exit with code: %s.', utils.getTime(), process.pid, code)
    })
  }



  /**
   * add new alone worker handle
   *
   * @param {*} alone
   * @memberof Master
   */
  onForkAlone(msg: types.AnyOptions) {
    if (msg.from === 'alone' && msg.to === 'app') {
      const alone = msg.data
      alone._title_ = this.options.title;
      this.workerManager.setAlone(alone);
    }
  }


  /**
   * alone worker ready
   *
   * @param {types.AnyOptions} msg
   * @memberof Master
   */
  onAloneWorkerReady(msg: types.AnyOptions) {
    const { from, to } = msg || {}
    if (from !== 'alone' || to !== 'app') {
      return
    }
    // set alone worker status
    const aloneWorker = this.workerManager.getAlone();
    aloneWorker.status = 'started';
    aloneWorker.duration = (Date.now() - this.startTime) / 1000 + 's';
    // start cluster worker
    if (!this.isStarted) {
      this.startClusterWorker();
    } else {
      this.console()
    }
  }


  /**
   * receive alone msg and forwarding to woker
   *
   * @param {types.AnyOptions} msg
   * @memberof Master
   */
  onFromAloneToWorker(msg: types.AnyOptions) {
    const { action, type = 'worker' } = msg || {}
    if (!action) {
      return
    }

    const aliveWorkers = this.workerManager.getAliveWorkers() || []

    if (type === 'worker') {
      // random notice a worker
      const index = utils.randomWorker(aliveWorkers.length) - 1
      const worker = aliveWorkers[index]
      worker && sendmessage(worker, msg)
    } else {
      // notice all worker
      aliveWorkers.forEach((worker: any) => {
        sendmessage(worker, msg)
      })
    }
  }


  /**
  * receive alone msg and forwarding to woker
  *
  * @param {types.AnyOptions} msg
  * @memberof Master
  */
  onFromWorkerToAlone(msg: types.AnyOptions) {
    const { action } = msg || {}
    if (!action) return

    const aliveWorkers = this.workerManager.getAlone()

    if (!aliveWorkers) return

    sendmessage(aliveWorkers, msg);
  }



  /**
   * alone worker exit handle
   *
   * @param {*} msg
   * @memberof Master
   */
  onAloneExit(msg: types.AnyOptions) {
    if (msg.from !== 'alone' || msg.to !== 'app') {
      return
    }

    if (this.closed) return;
    const data = msg.data || {}
    const aloneWorker = this.workerManager.getAlone();

    // remove all listeners to avoid memory leak
    try { aloneWorker.removeAllListeners(); } catch (err) { };

    utils.logger({
      level: 'error',
      color: 'red',
      log: util.format('[%s] [app] alone_worker#%s:%s died (code: %s, signal: %s)',
        utils.getTime(), aloneWorker.id, aloneWorker.pid, data.code, data.signal)
    })

    // alone exit counter 
    this.emit('from-alone-to-worker', { from: 'app', to: 'worker', type: 'worker', action: 'alone-process-exit-counter' })

    this.workerManager.deleteAlone();

    if (this.isStarted) {
      setTimeout(() => { this.startAloneWorker(); }, 100)
    } else {
      process.exit(1);
    }
  }


  /**
   * close alone worker
   *
   * @memberof Master
   */
  closeAgentWorker() {
    const agentWorker = this.workerManager.getAlone();
    if (agentWorker) {
      logger.window().info('[master] kill alone worker with signal SIGTERM.');
      this.workerManager.deleteAlone()
    }
  }


  /**
   * random select a worker
   *
   * @memberof Master
   */
  randomSelectAWorker() {
    // random select a worker.
    const workers = this.workerManager.getAliveWorkers()
    const randomNumber = utils.randomWorker(workers.length)
    if (randomNumber <= 0) {
      return
    }
    // random worker index
    const index: number = randomNumber - 1
    // random worker
    const worker: any = workers[index]

    // record randomly selected worker.
    // this will be useful if the worker restart.
    this.randomSelectWorker = {
      worker_id: worker.id,
      worker_pid: worker.process.pid
    }

    utils.logger({
      level: 'info',
      color: 'yellow',
      log: util.format('[%s] [app] readom select worker pid is: [%s]', utils.getTime(), worker.process.pid)
    })

    // only send message to chose worker. 
    sendmessage(worker, {
      action: 'random-select-worker',
      from: 'app',
      to: 'worker',
      worker_id: worker.id,
      worker_pid: worker.process.pid
    });
  }



  /**
   * success console
   *
   * @memberof Master
   */
  console() {
    const result = this.workerManager.getWorkerMsg();
    const titleLen = this.options.title.length + 2;
    const version = this.options.yunflyVerfion || this.cluserPackagejson.version;

    let log: string = util.format('\n┌─%s─┬─%s─┬─%s─┬─%s─┬─%s─┬─%s─┬─%s─┬─%s─┐\n',
      L({ len: 3 }), L({ len: titleLen }), L({ len: 8 }), L({ len: 15 }), L({ len: 10 }), L({ len: 8 }), L({ len: 8 }), L({ len: 8 }));
    log += util.format('│ %s │ %s │ %s │ %s │ %s │ %s │ %s │ %s │\n',
      L({ len: 3, str: 'id', color: 'cyan' }), L({ len: titleLen, str: 'name', color: 'cyan' }), L({ len: 8, str: 'type', color: 'cyan' }), L({ len: 15, str: 'version', color: 'cyan' }),
      L({ len: 10, str: 'duration', color: 'cyan' }), L({ len: 8, str: 'mode', color: 'cyan' }), L({ len: 8, str: 'pid', color: 'cyan' }), L({ len: 8, str: 'status', color: 'cyan' }))
    log += util.format('├─%s─┼─%s─┼─%s─┼─%s─┼─%s─┼─%s─┼─%s─┼─%s─┤\n',
      L({ len: 3 }), L({ len: titleLen }), L({ len: 8 }), L({ len: 15 }), L({ len: 10 }), L({ len: 8 }), L({ len: 8 }), L({ len: 8 }))
    result.forEach((item: types.AnyOptions) => {
      log += util.format('│ %s │ %s │ %s │ %s │ %s │ %s │ %s │ %s │\n',
        L({ len: 3, str: item.id, color: 'green' }), L({ len: titleLen, str: item.name, color: 'green' }), L({ len: 8, str: item.type, color: 'white' }), L({ len: 15, str: version, color: 'white' }),
        L({ len: 10, str: item.duration, color: 'green' }), L({ len: 8, str: item.mode, color: 'white' }), L({ len: 8, str: item.pid, color: 'white' }), L({ len: 8, str: item.status, color: 'green' }))
    })
    log += util.format('└─%s─┴─%s─┴─%s─┴─%s─┴─%s─┴─%s─┴─%s─┴─%s─┘',
      L({ len: 3 }), L({ len: titleLen }), L({ len: 8 }), L({ len: 15 }), L({ len: 10 }), L({ len: 8 }), L({ len: 8 }), L({ len: 8 }))
    utils.logger({ level: 'info', color: 'gray', log })
  }

}

// if you do not listen to this event
// cfork will listen it and output the error message to stderr
// process.on('uncaughtException', err => {
//   // do what you want
//   console.log('??????????????????????', err)
// });
