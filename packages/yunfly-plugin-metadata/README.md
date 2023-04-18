# tace 插件

## 简介

- 通过 metadata 透传数据

备注：

- `@yunflyjs/yunfly`已内置此功能, 不需要单独引用。

## 使用

1. 安装依赖

```ts
// 该插件依赖apm服务
yarn add @yunflyjs/yunfly-plugin-metadata
```

2. `config.plugin.ts` 中声明插件

```ts title="src/config/config.plugin.ts"
const plugins: { [key: string]: string }[] = [
  {
    name: 'metadata',
    package: '@yunflyjs/yunfly-plugin-metadata',
  },
];
export default plugins;
```

3. `config.default.ts` 配置项 （可选）

```ts
// 该插件依赖 currentContext 能力
config.currentContext = {
  enable: true,
}
```

## api 使用

```ts
import { Get } from '@yunflyjs/yunfly'
import { metadata } from '@yunflyjs/yunfly-plugin-metadata'


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
