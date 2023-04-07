import { TypeMaster } from "../types";

const EventEmitter = require('events');


// worker manager to record alone and worker forked by cfork
export default class Manager extends EventEmitter {

  constructor(options: TypeMaster) {
    super();
    this.workers = new Map();
    this.alone = null;
    this.options = options || {}
  }

  /**
   * get alone worker
   *
   * @return {*} 
   * @memberof Manager
   */
  getAlone() {
    return this.alone
  }

  /**
   * set alone worker
   *
   * @param {*} alone
   * @memberof Manager
   */
  setAlone(alone: any) {
    this.alone = alone;
  }

  /**
   * delete alone process
   *
   * @memberof Manager
   */
  deleteAlone() {
    if (!this.alone) return
    try { this.alone.removeAllListeners(); } catch (err) { }
    this.alone = null;
  }

  /**
   * get alive worker
   *
   * @memberof Manager
   */
  getAliveWorkers() {
    const aliveWorkers = [];
    for (const worker of this.workers.values()) {
      if (worker.state === 'listening') {
        aliveWorkers.push(worker);
      }
    }
    return aliveWorkers;
  }

  /**
   * set worker process
   *
   * @param {*} worker
   * @memberof Manager
   */
  setWorker(worker: any) {
    this.workers.set(worker.process.pid, worker);
  }

  /**
   * get worker process
   *
   * @param {number} pid
   * @return {*} 
   * @memberof Manager
   */
  getWorker(pid: number) {
    return this.workers.get(pid);
  }

  /**
   * delete worker process
   *
   * @param {number} pid
   * @memberof Manager
   */
  deleteWorker(pid: number) {
    this.workers.delete(pid);
  }

  /**
   * view worker ids
   *
   * @return {*} 
   * @memberof Manager
   */
  listWorkerIds() {
    return Array.from(this.workers.keys());
  }

  /**
   * get listening state worker process. 
   * if state is lintening. It means working.
   * @return {*} 
   * @memberof Manager
   */
  getListeningWorkerIds() {
    const keys = [];
    for (const id of this.workers.keys()) {
      if (this.getWorker(id).state === 'listening') {
        keys.push(id);
      }
    }
    return keys;
  }

  /**
   * get alone process and worker process ids.
   *
   * @return {*} 
   * @memberof Manager
   */
  count() {
    return {
      alone: (this.alone && this.alone.status === 'started') ? 1 : 0,
      worker: this.listWorkerIds().length,
    };
  }

  /**
   * check alone and worker must both alive
   * if exception appear 3 times, emit an exception event
   * @memberof Manager
   */
  startCheck() {
    this.exception = 0;
    this.timer = setInterval(() => {
      const count = this.count();
      if (
        (this.options.alone && count.alone && count.worker) ||
        (!this.options.alone && count.worker)
      ) {
        this.exception = 0;
        return;
      }
      this.exception++;
      if (this.exception >= 3) {
        this.emit('exception', count);
        clearInterval(this.timer);
      }
    }, 10000);
  }


  /**
   * get worker id,name,pid,states
   *
   * @memberof Manager
   */
  getWorkerMsg() {
    const result: any[] = []

    this.alone && result.push({
      id: this.alone.id,
      pid: this.alone.pid,
      name: this.alone._title_,
      mode: 'fork',
      status: this.alone.status,
      type: 'alone',
      duration: this.alone.duration,
    })

    for (const worker of this.workers.values()) {
      if (worker.isDevReload) {
        continue
      }

      const workerMsg = {
        id: worker.id,
        pid: worker.process.pid,
        name: worker._title_,
        mode: 'cluster',
        status: worker.state,
        type: 'worker',
        duration: worker.duration,
      }
      result.push(workerMsg)
    }
    return result;
  }

}
