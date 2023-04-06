import { getCurrentContext } from '../../core/current-context';
import { getYunflyApp } from '../../script/app';

/**
 * yunfly controller
 *
 * @export
 * @class Controller
 * @extends {YunflyApp}
 */
export default class Controller {
  constructor() {
    //
  }

  /**
   * return yunfly app
   *
   * @readonly
   * @type {Yunfly.YunflyAppConfig}
   * @memberof Controller
   */
  get app(): Yunfly.YunflyAppConfig {
    return getYunflyApp();
  }

  /**
   * return koa context
   *
   * @readonly
   * @memberof YunflyApp
   */
  get ctx() {
    return getCurrentContext();
  }
}
