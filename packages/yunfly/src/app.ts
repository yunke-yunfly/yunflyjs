import  { setLogFilter } from '@yunflyjs/loggers';


/**
 * BFF 生命周期
 *
 * @export
 * @class AppLifeHook
 */
export default class AppLifeHook {
  constructor() {
    //
  }
  configDidReady(config: any): void {
    if (config.logFilter) {
      setLogFilter(config.logFilter);
    }
  }
}
