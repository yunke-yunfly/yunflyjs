import { Config, getCurrentContext } from '@yunflyjs/yunfly-core'
import _ from 'lodash';
import { MetadataConfig } from '../type';

/**
 * metadata handle
 *
 * @class Medata
 */
export default class Medata {
  config: Config;

  setConfig(config: Config) {
    this.config = config;
  }

  /**
   * set custom metadata
   *
   * @protected
   * @param {string} key
   * @param {{ value: any; type: string }} value
   * @return {*}  {*}
   * @memberof Medata
   */
  protected setCustomContext(key: string, value: { value: any; type: string }): any {
    const ctx: any = getCurrentContext();
    if (!_.get(ctx, 'currentTransaction._custom')) {
      ctx.currentTransaction._custom = {}
    };

    if (!ctx.currentTransaction._custom[key]) {
      ctx.currentTransaction._custom[key] = [];
    }

    if (value.type === 'add') {
      ctx.currentTransaction._custom[key].push(value.value);
      return
    }

    if (value.type === 'set') {
      ctx.currentTransaction._custom[key] = [value.value];
      return
    }

    if (value.type === 'remove') {
      const index = ctx.currentTransation._custom[key].indexOf(value.value);
      if (index > -1) {
        ctx.currentTransation._custom[key].splice(index, 1);
      }
      return
    }
  }

  /**
   * check currentContext is enable
   *
   * @protected
   * @memberof Medata
   */
  protected check() {
    if (!_.get(this.config, 'currentContext.enable')) {
      throw Error('新增 metadata 失败, 请检查 config.currentContext 配置是否开启!');
    }
  }

  /**
   * add metadata
   *
   * @param {string} key
   * @param {string} value
   * @memberof Medata
   */
  add(key: string, value: string): void {
    this.check();
    this.setCustomContext(key, { value, type: 'add' });
  }

  /**
   * set metadata
   *
   * @param {string} key
   * @param {string} value
   * @returns {void}
   * @memberof Medata
   */
  set(key: string, value: string): void {
    this.check();
    this.setCustomContext(key, { value, type: 'set' });
  }

  /**
   * remove key
   *
   * @param {string} key
   * @returns {void}
   * @memberof Medata
   */
  remove(key: string): void {
    this.check();
    this.setCustomContext(key, { value: null, type: 'remove' });
  }

  /**
   * get metadata
   *
   * @readonly
   * @memberof Medata
   */
  getMap(): MetadataConfig {
    this.check();
    const ctx = getCurrentContext();
    return _.get(ctx, 'currentTransaction._custom');
  }

  /**
   * get metedata
   *
   * @param {string} key
   * @return {*}  {any[]}
   * @memberof Medata
   */
  get(key: string): MetadataConfig[] {
    this.check();
    const ctx = getCurrentContext();
    return _.get(ctx, ['currentTransaction', '_custom', key]);
  }

}

