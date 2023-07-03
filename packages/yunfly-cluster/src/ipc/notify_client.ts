const Base = require('sdk-base');

class NotifyClient extends Base {
  constructor() {
    super();
    this._registered = new Map();
    this.ready(true);
  }

  subscribe(reg: any, listener: any) {
    const key = reg.key;
    this.on(key, listener);
  }

  once(reg: any, listener: any) {
    const key = reg.key;
    this.once(key, listener);
  }

  publish(reg: any) {
    const key = reg.key;
    this.emit(key, reg.value);
    return true;
  }

}

module.exports = NotifyClient;