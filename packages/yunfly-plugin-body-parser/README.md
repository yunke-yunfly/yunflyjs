# body-parser 插件

## 简介

- `@yunflyjs/yunfly-plugin-body-parser`: `yunfly` 获取`body`参数插件

- 该插件yunfly 框架已内置, 不需要单独引用。

## 使用

1. 安装依赖

```ts
yarn add @yunflyjs/yunfly-plugin-body-parser
```

2. `config.plugin.ts` 中声明插件

```ts
plugins.push({
  name: 'bodyParser',
  path: '@yunflyjs/yunfly-plugin-body-parser',
})
```

3. `config.default.ts` 配置项 （可选）

```ts
// body参数配置
config.bodyParser = {
  jsonLimit: '1mb',
  formLimit: '1mb',
  queryString: {
    parameterLimit: 1 * 1024 * 1024,
  },
};
```

- 参考文档：
<https://www.npmjs.com/package/koa-bodyparser#options>
