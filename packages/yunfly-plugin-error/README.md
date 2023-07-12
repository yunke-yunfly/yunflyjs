# @yunflyjs/yunfly-plugin-error

- Node 应用统一错误处理插件

## 使用

- 插件已内置在yunfly框架中

1. `config.default.ts` 配置项 （可选）

```ts title="src/config/config.default.ts"
/**
 * error handle
 */
config.error = {
  enable: true,

  // use yunfly default error log.
  useYunflyLog: true,

  /**
   * error code
   * Type: number | true | Record<Key, Key>
   */
  errCode: true,

  // enable http state
  enableHttpCode: false,

  // enable rpc error message
  useRpcErrorMessage: true,

  // enable return rpc error message
  showMessageDetail: true,

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
