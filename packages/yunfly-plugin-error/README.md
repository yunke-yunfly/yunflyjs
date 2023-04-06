# @yunflyjs/yunfly-plugin-error

- Node 应用统一错误处理插件

`@yunflyjs/yunfly` 框架已内置此插件。

## 使用

- 1. 安装依赖

```ts
yarn add @yunflyjs/yunfly-plugin-error
```

- 2. `config.plugin.ts` 中声明插件

```ts title="src/config/config.plugin.ts"
const plugins: {[key:string]: string}[] = [
  {
    name: 'error',
    package: '@yunflyjs/yunfly-plugin-error'
  }
];
export default plugins;
```

- 3. `config.default.ts` 配置项 （可选）

```ts title="src/config/config.default.ts"
/**
 * error handle
 */
config.error = {
  enable: true,

  // use yunfly default error log.
  useYunflyLog: true,

  /**
   * 错误码
   * Type: number | true | Record<Key, Key>
   */
  errCode: true,

  // 是否开启 HTTP 状态码
  enableHttpCode: false,

  // 是否返回 rpc 错误信息
  useRpcErrorMessage: true,

  // 是否返回错误详情
  showMessageDetail: true,

  /* Customize your error fn. （Optional） */
  // customError: async (err: any, ctx: Context) => {}

  unhandledRejection: (err: any) => {
    console.error('UnhandledRejection error, at time', Date.now(), 'reason:', err);
  },
  uncaughtException: (err: any) => {
    console.error('uncaughtException error, at time', Date.now(), 'reason:', err);
  },
};
```

| 字段| 类型    | 默认值  | 必填    | 说明     |
| ---------- | -------- | ------- | --------- | ------- |
| enable             | `boolean`                             | `true`  | 是  | 是否开启错误处理      |
| errCode            | `number/true/Record<Key, Key>`    | `2`     | 否      | 错误码              |
| useYunflyLog       | `boolean`                             | `true`  | 否  | 是否开启日志记录      |
| enableHttpCode     | `boolean`                             | `false` | 否  | 是否开启 HTTP 状态码  |
| useRpcErrorMessage | `boolean`                             | `true`  | 否  | 是否返回 rpc 错误信息  |
| showMessageDetail  | `boolean`                             | `false` | 否  | 是否返回错误详情   |
| customError        | `(err: any, ctx: Koa.Context) => any` |         | 否  | 自定义错误，若定义，则不会执行`yunfly-plugin-error`中间件后续逻辑  |
| customErrorHandle  | `(err: any, ctx: Koa.Context) => any` |         | 否  | 可用于重新组装错误，并不影响`yunfly-plugin-error`中间件后续逻辑的执行  |
| unhandledRejection | `(err: any, ctx: Koa.Context) => any` |         | 否  | 自定义 Promise 错误   |
| uncaughtException  | `(err: any, ctx: Koa.Context) => any` |         | 否  | 自定义未能捕获的异常  |
