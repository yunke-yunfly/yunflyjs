import { AnyOptions } from "../types";

const cluster = require('cluster');
const sendmessage = require('sendmessage');
const debug = require('debug')('yunfly-cluster:messenger');


/**
 * master messenger,provide communication between master, alone, and worker.
 */
export default class Messenger {
  master: any;
  hasParent: boolean;


  constructor(master: any) {
    this.master = master;
    this.hasParent = !!process.send;
    // process.on('message', msg => {
    //   console.log('/////////////////', msg)
    //   this.send(msg);
    // });
    // process.once('disconnect', () => {
    //   this.hasParent = false;
    // });
  }

  /**
   * send message
   * @param {Object} data message body
   *  - {String} from from who
   *  - {String} to to who
   */
  send(data: AnyOptions) {
    if (!data.from) {
      data.from = 'master';
    }

    // recognise receiverPid is to who
    if (data.receiverPid) {
      if (data.receiverPid === String(process.pid)) {
        data.to = 'master';
      } else {
        data.to = 'app';
      }
    }

    // default from -> to rules
    if (!data.to) {
      if (data.from === 'app') data.to = 'agent';
      if (data.from === 'parent') data.to = 'master';
    }

    // app -> master
    if (data.to === 'master') {
      debug('%s -> master, data: %j', data.from, data);
      // app/agent to master
      this.sendToMaster(data);
      return;
    }

    // master -> parent
    // app -> parent
    // agent -> parent
    if (data.to === 'parent') {
      debug('%s -> parent, data: %j', data.from, data);
      this.sendToParent(data);
      return;
    }

    // parent -> master -> app
    // agent -> master -> app
    if (data.to === 'app') {
      debug('%s -> %s, data: %j', data.from, data.to, data);
      this.sendToAppWorker(data);
      return;
    }

  }

  /**
   * send message to master self
   * @param {Object} data message body
   */
  sendToMaster(data: AnyOptions) {
    this.master.emit(data.action, data.data);
  }

  /**
   * send message to parent process
   * @param {Object} data message body
   */
  sendToParent(data: AnyOptions) {
    if (!this.hasParent) {
      return;
    }
    // process.send(data);
  }

  /**
   * send message to app worker
   * @param {Object} data message body
   */
  sendToAppWorker(data: AnyOptions) {
    for (const id in cluster.workers) {
      const worker = cluster.workers[id];
      if (worker.state === 'disconnected') {
        continue;
      }
      // check receiverPid
      if (data.receiverPid && data.receiverPid !== String(worker.process.pid)) {
        continue;
      }
      sendmessage(worker, data);
    }
  }


}
