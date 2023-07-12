/**
 * yunfly 插件
 * 数组顺序就是插件的加载顺序
 */
import { PluginConfig } from '@yunflyjs/yunfly-core';

const plugins: PluginConfig[] = [
  {
    name: 'bodyParser',
    package: '@yunflyjs/yunfly-plugin-body-parser',
    priority: 4
  },
  {
    name: 'error',
    package: '@yunflyjs/yunfly-plugin-error',
    priority: 5
  },
];

export default plugins;
