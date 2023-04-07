# @yunflyjs/errors

## 简介

快速定位问题以及统一统计错误信息 Error 类。

## 快速上手

```bash
yarn add @yunflyjs/errors
```

```ts
import { NotFoundError } from '@yunflyjs/errors'

@Get("/users/:id")
getOne(@Param("id") id: number) {
  const user = this.userService.findOneById(id);
  if (!user) {
    throw new NotFoundError("找不到此用户"); // message 可选
  }

  return user;
}
```

如果是结合 yunfly，最后的返回结果为：

```ts
{
  code: 404,
  msg: "找不到此用户"
}
```

## YunkeError 属性说明

所有的内置 Error 类都是继承于 `YunkeError` 类，那么我们就需要了解一下 YunkeError 类包含的内容：

```ts
interface YunkeError {
  // 错误名
  name: string;
  // HTTP 状态码
  httpCode?: number;
  // 自定义错误码
  code?: number | string;
  // 错误信息
  message?: string;
  // 错误详情
  // 因为有些信息不能返回给用户，但是需要记录到阿里云，故通过此属性保留
  messageDetail?: any;
}
```

### name

会自动读取当前 Error 类的类名，不需要配置，自动读取当前类名。

### code

code 的命名有三种规则：

- 规则 1：http 错误类

http 错误类 code 参考业界标准，例如 400、401、403、500、503 等。

- 规则 2：yunfly 框架及周边生态

从 10000 开头，每个应用占 100 个间隔，例如 redis 错误为为 10100 - 10199，默认值是 10100

- 规则 3：rpc 调用错误

rpc 调用错误根据 go 语言返回的结果确定，如果没有，则默认为 -1。

- 规则 4：用户自定义错误
  
严格上，用户自定义错误只要不和上述规则冲突即可，推荐从 40000 开始。

### httpCode

对于内置错误类而言，HTTP 状态码规则如下：

- HTTP 错误类，HTTP 状态码和 code 码是相同的，例如 401，HTTP 状态码和错误码都为 401
- 对于 rpc 调用错误，统一 500
- yunfly 框架及周边生态错误错误，导致服务器报错的，就是 500，其他视情况而定
- 用户自定义错误类，就由用户自己确定

### message

错误信息，可自定义。

### messageDetail

错误详情，例如在 rpc 调用时出现错误时，会返回很多的错误信息，这个信息实际是不需要给用户看的，我们可以通过赋值给 `messageDetail` 属性来达到最终记录到阿里云日志的效果（框架会读这个字段）。

## 内置 Error 类列表

内置的 Error 分为三类，分别为：

**HTTP 相关 Error**：

| **错误类** | **含义** | **HTTP 状态码** | **code 码** |
| --- | --- | --- | --- |
| BadRequestError | 参数错误 | 400 | 400 |
| UnauthorizedError | 用户未登录 | 401 |401 |
| ForbiddenError | 用户无权限 | 403 | 403 |
| NotFoundError | 找不到相关资源 | 404 |404 |
| MethodNotAllowedError | 方法不允许 | 405 | 405 |
| TooManyRequestsError | 过多请求 |  429 | 429 |
| InternalServerError | 代码不严谨导致的服务器错误 | 500 |500 |
| BadGatewayError | 网关错误 | 502 |502 |
| ServiceUnavailableError | 服务不可用 | 503 |503 |
| GatewayTimeoutError | 网关超时 | 504 |504 |

**RPC Error**：

| **错误类** | **含义** | **HTTP 状态码** | **code 码** |
| --- | --- | --- |--- |
| RpcError | RPC 错误 | 500 | code 由 go 返回的决定，默认值是 -1 |

**yunfly 框架及周边生态**：

| **错误类** | **含义** | **HTTP 状态码** | **code 码范围** |
| --- | --- | --- |--- |
| YunflyError | yunfly 框架自身异常 | 500 | 10000 ~ 1099 |
| ApolloError | Apollo 错误 | 500 | 10100 ~ 10199 |
| RedisError |  Redis 错误 | 500 | 10200 ~ 10299 |
| EctdError |  ECTD 错误 | 500 | 10300 ~ 10399 |
| MysqlError |  Mysql 错误 | 500 | 10400 ~ 10499 |
| MongoDBError | MongoDB 错误 | 500 | 10500 ~ 10599 |

## 使用方式

错误类可以有四种抛出方式，分别为：

- 1、全部使用默认值

```js
throw new BadRequest()
```

- 2、更改 message 信息

```js
throw new BadRequest("用户名不为空") // 仅修改 message
```

- 3、更改更多的信息

> 与已有参数是 merge 关系

```js
throw new YunkeError({ message: "用户名不为空", code: 400001 }) // 同时修改 message 和 httpCode
```

- 4、传递已有的错误

```ts
import { RpcError } from '@yunflyjs/errors'
const { error, response } = await userServiceV2.getUser({
  request, metadata
});

if (error) {
  throw new RpcError(error) // 抛出已有的 Error 类
}
```

- 5、针对 RpcError 和 InternalServerError

因为 RpcError 和 InternalServerError 是基于已有的 Error 信息进行抛错的，而原有的 Error message 属性实际是不需要展示给用户的，例如代码运行报错，error 的 message 内容就是某行某语法不正确，这个东西我们只需要记录日志即可。

所以针对这两个类做了特殊处理，将他们的第一个参数的 message 属性当做 messageDetail，并且提供了第二个参数作为 message，如果没传，则默认为 “服务器异常，请重试”，具体使用方式如下：

```js
import { RpcError, InternalServerError} from '@yunflyjs/errors'

try {
  // ...
} catch(error) {
  throw new InternalServerError(error) // 无第二个参数情况下，message 为 “服务器异常，请重试”
  throw new InternalServerError(error, "出错了~") // 传了参数，则为传递的参数 “出错了~”
}


// 道理同上
throw new RpcError(error) 
throw new RpcError(error, "出错了~")
```

## 自定义 Error 类

内置类肯定是没办法满足所有需求的，我们还需要定义一些自己的业务类，具体步骤如下：

```ts
import { YunkeError, YunkeErrorOptions } from '@yunflyjs/errors'

// 继承 yunke error
class CustomError extends YunkeError {
  // 其他几个信息也可以自定义
  constructor(options?: YunkeErrorOptions) {
    super(options);
    this.code = this.code ?? 400001;
    // ?? 的意思是前者为 undefined 或者 null 时，则使用后者
    this.httpCode = this.httpCode ?? 400;
    // || 的意思是，前面为 falsy 时，则使用后者（因为 Error 类的 message 默认值是 '', 所以这里使用了 || ）
    this.message = this.message || '自定义错误信息'; 
  }
}
```

## 错误日志查看

有了上述错误信息，我们就可以轻松定位 Error 信息，例如我们需要定位用户登录失败的问题：

- 1.首先拿到 `trace-id`

- 2.登录贾维斯日志查询并选择相应的环境

- 3.输入 `trace-id`

- 4.根据 Error 类进行判断，可以推断出是 Go 服务的报错
