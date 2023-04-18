# tace 插件

## 简介

- 日志链路，通过 trace-id 串联日志信息, 便于文档排查。

备注：

- `@yunke/yunfly`已内置此功能, 不需要单独引用。`@yunke/yunfly-unit` 需要单独安装并启用。

## 使用

1. 安装依赖

```ts
// 该插件依赖apm服务
yarn add @yunke/yunfly-plugin-apm @yunke/yunfly-plugin-metadata
```

2. `config.plugin.ts` 中声明插件

```ts title="src/config/config.plugin.ts"
const plugins: { [key: string]: string }[] = [
  {
    name: 'apm',
    package: '@yunke/yunfly-plugin-apm',
  },
  {
    name: 'metadata',
    package: '@yunke/yunfly-plugin-metadata',
  },
];
export default plugins;
```

3. `config.default.ts` 配置项 （可选）

```ts
// run apm config
config.apm = {
  active: process.env.NODE_ENV === 'production',
};

config.metadata = {
  enable: true,
}
```

## api 使用

```ts
import { Get } from '@yunke/yunfly'
import { metadata } from '@yunke/yunfly-plugin-metadata'


// 案例：Controller中使用
class SomeController {

  Get('/user')
  async getUser() {
    // 通过 metadata.add 添加
    metadata.add('name','zane');
    // 
    return true;
  }
}
```

详细文档请参考参数透传： <https://yued.myscrm.cn/bff-doc-v4/docs/high-function/param-trans>
