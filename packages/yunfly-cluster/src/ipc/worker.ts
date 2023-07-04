import * as utils from "../utils/util";
const util = require('util');
const YunflyClient = require('./client')

let workerClient: any;
export default function getWorkerClient() {
  if (workerClient) {
    return workerClient;
  }
  let client: any;
  client = new YunflyClient();
  client.ready((err: any) => {
    if (err) {
      utils.logger({
        level: 'error', color: 'red',
        log: util.format(
          '[%s] worker %s cluster-client ready failed, leader:%s, errMsg:%s',
          utils.getTime(),
          process.pid,
          client.isClusterClientLeader,
          err.message
        )
      })
    } else {
      workerClient = client;
      utils.logger({
        level: 'log', color: 'magenta',
        log: util.format(
          '[%s] worker %s cluster-client ready,leader:%s',
          utils.getTime(),
          process.pid,
          client.isClusterClientLeader,
        )
      })
    }
  });
  return client;
}


