
const APIClientBase = require('cluster-client').APIClientBase;

class YunflyClient extends APIClientBase {
  get DataClient() {
    return require('./notify_client');
  }

  get clusterOptions() {
    return {
      responseTimeout: 10000,
      name: `yunfly-cluster-server-${process.version}`,
    };
  }

  subscribe(...args: any[]) {
    return this._client.subscribe(...args);
  }

  once(...args: any[]) {
    return this._client.once(...args);
  }

  unSubscribe(...args: any[]) {
    return this._client.unSubscribe(...args);
  }

  publish(...args: any[]) {
    return this._client.publish(...args);
  }

  close() {
    return this._client.close();
  }
}

module.exports = YunflyClient;