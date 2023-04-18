import Medata from './lib/index';
import { MetadataOption } from './type';

const metadata = new Medata();

/**
 * yunfly plugin
 *
 * @export
 * @param {*} { app, pluginConfig }
 * @returns {void}
 */
export default function MetadataPlugin({ config }: MetadataOption): void {
  // 初始化config
  metadata.setConfig(config);
}

export {
  metadata,
};
