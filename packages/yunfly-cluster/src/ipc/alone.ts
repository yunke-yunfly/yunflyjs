
import * as utils from "../utils/util";
const util = require('util');
const YunflyClient = require('./client');

let aloneClient: any;
export default function getAloneClient() {
  if(aloneClient) {
    return aloneClient;
  }
  let client: any;
  client = new YunflyClient();
  client.ready((err: any) => {
    if (err) {
      aloneClient = null;
      utils.logger({
        level: 'error', color: 'red',
        log: util.format(
          '[%s] alone %s cluster-client ready failed, leader:%s, errMsg:%s',
          utils.getTime(),
          process.pid,
          client.isClusterClientLeader,
          err.message
        )
      })
    } else {
      utils.logger({
        level: 'log', color: 'magenta',
        log: util.format(
          '[%s] alone %s cluster-client ready,leader:%s',
          utils.getTime(),
          process.pid,
          client.isClusterClientLeader,
        )
      })
    }
  });
  aloneClient = client;
  return client;
}



