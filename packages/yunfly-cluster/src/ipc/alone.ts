
import * as utils from "../utils/util";
const util = require('util');
const YunflyClient = require('./client');
const aloneFile = process.env.YUNFLY_CLUSTER_ALONE_FILE;

let client: any;
if (aloneFile) {
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
}

export default client;