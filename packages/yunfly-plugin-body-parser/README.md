# body-parser 插件

## 简介

- `@yunflyjs/yunfly-plugin-body-parser`: `yunfly` 获取`body`参数插件

## 使用

- 插件已内置在yunfly框架中

1. `config.default.ts` 配置项 （可选）

```ts
config.bodyParser = {
  enable: true,
  jsonLimit: '5mb',
  formLimit: '5mb',
  queryString: {
    parameterLimit: 5 * 1024 * 1024,
  },
};
```

- 参考文档：
<https://www.npmjs.com/package/koa-bodyparser#options>
