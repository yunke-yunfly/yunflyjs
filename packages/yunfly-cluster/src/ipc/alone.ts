
import * as utils from "../utils/util";
const util = require('util');
const YunflyClient = require('./client');

let aloneClient: any;
export default function getAlongClient() {
  if(aloneClient) {
    return aloneClient;
  }
  let client: any;
  client = new YunflyClient();
  client.ready((err: any) => {
    if (err) {
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
      aloneClient = client;
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
  return client;
}



