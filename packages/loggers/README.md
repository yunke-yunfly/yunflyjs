# @yunflyjs/loggers

`logger` 日志库，同时把日志输出到控制台与日志系统中，可以自定义控制台输出能力。

## 使用

- 安装依赖

yunfly 框架已内置。

```ts
yarn add @yunflyjs/loggers
```

- 使用

### 使用 logger api

```ts
import logger from '@yunflyjs/loggers';

logger.log('1111');
logger.info('hello %d', 'world!');
logger.error('some error!');
logger.access('access log');
```

### 链式调用

```ts
import logger from '@yunflyjs/loggers';

// 颜色输出
logger.color('#2e8555').log('1111');

// 日志前缀
logger.prefix('yunfly').info('hello %d', 'world!');

// 控制台同步输出
logger.window().error('some error!');
```

### console 代理

框架代理了 console 方法，因此 console 打印的日志也会输出到文件中。

```ts
console.log('1111');
console.info('hello %d', 'world!');
console.error('some error!');
console.access('access log');
```

## 方法说明

### color

控制台输出日志时附带颜色（开发模式下有效）

```ts
import logger from '@yunflyjs/loggers';

// 自定义输出颜色
logger.color('#2e8555').log('自定义输出颜色');

// 随机输出颜色
logger.color().log('随机输出颜色');
```

### window

生产环境下日志默认输出到日志文件中，控制台不输出日志，可以通过 `window` 方法来定义控制台是否输出日志。

```ts
import logger from '@yunflyjs/loggers';

logger.window().log('控制台中也输出日志');
```

### prefix

输出日志附加前缀并给当前日志打标识

```ts
import logger from '@yunflyjs/loggers';

logger.prefix('yunfly').log('这是输出的日志内容!');
// output: 【yunfly】: 这是输出的日志内容!
```

- 备注：

`prefix`: 当前`log`名称, 可通过 `process.env.YUNFLY_DEBUG` 和 `process.env.YUNFLY_DEBUG_TYPE` 进行控制输出, 跟 `debug` 库类似。

- 案例二：通过 `YUNFLY_DEBUG` 环境变量控制日志输出

```ts
import logger from '@yunflyjs/loggers';

process.env.YUNFLY_DEBUG = 'yunfly';

logger.prefix('yunfly').info('控制台输出当前日志!');
// output: 【yunfly】: 控制台输出当前日志!

logger.prefix('yundoc').info('控制台不会输出当前日志!');
// output: 
```

### onlySign

当使用 `prefix` 给日志添加标识时，日志输出会附加`标识前缀`, 如果只想做日志标识而不想输出前缀，这时可通过 `onlySign` 进行控制。

```ts
import logger from '@yunflyjs/loggers';

logger.prefix('yunfly').info('控制台输出有前缀的日志!');
// output: 【yunfly】: 控制台输出有前缀的日志!

logger.prefix('yunfly').onlySign().info('控制台不会输出有前缀的日志!');
// output: 控制台不会输出有前缀的日志!
```

### logFilter

日志信息过滤函数。

- 通过链式调用配置日志过滤器

```ts
import logger from '@yunflyjs/loggers';

const logFilter = (logType?: any, ...optionalParams: any[]) =>
    optionalParams.map((item: any) => {
    if (typeof item === 'string') {
        // 过滤密码等敏感字符
        return item.replace(/("password\\?":\\?")([^\\?"]+)(\\?")/g, (target, $1, $2, $3) => `${$1}${new Array($2.length).join('*')}${$3}`);
    }
    return item;
});

logger.logFilter(logFilter).info('password: 123456');
```

- 通过 `api` 设置日志过滤器

```ts
import logger from '@yunflyjs/loggers';

const logFilter = (logType?: any, ...optionalParams: any[]) =>
    optionalParams.map((item: any) => {
    if (typeof item === 'string') {
        // 过滤密码等敏感字符
        return item.replace(/("password\\?":\\?")([^\\?"]+)(\\?")/g, (target, $1, $2, $3) => `${$1}${new Array($2.length).join('*')}${$3}`);
    }
    return item;
});

setLogFilter(logFilter);

logger.info('password: 123456');
```

- 通过参数设置日志过滤器

```ts
import { debug } from '@yunflyjs/loggers';

const logFilter = (logType?: any, ...optionalParams: any[]) =>
    optionalParams.map((item: any) => {
    if (typeof item === 'string') {
        // 过滤密码等敏感字符
        return item.replace(/("password\\?":\\?")([^\\?"]+)(\\?")/g, (target, $1, $2, $3) => `${$1}${new Array($2.length).join('*')}${$3}`);
    }
    return item;
});
const logger = debug({ logFilter });

logger.info('password: 123456');
```

### argumentsHandle

日志打印之前对日志参数进行处理函数。

- 通过链式调用配置处理器

```ts
import logger from '@yunflyjs/loggers';

const handle = (...args: any[]): any[] => {
    return args.map((item)=>{
        return item + '加了一点东西!'
    })
}

logger.argumentsHandle(handle).info('自定义日志处理逻辑！');
```

- 通过 `setArgsHandle` 配置处理器

```ts
import logger, { setArgsHandle } from '@yunflyjs/loggers';

const handle = (...args: any[]): any[] => {
    return args.map((item)=>{
        return item + '加了一点东西!'
    })
}

setArgsHandle(handle)

logger.info('自定义日志处理逻辑！');
```

- 可通过 `setEnableLogger` 设置是否输出日志文件

```ts
import logger, { setEnableLogger } from '@yunflyjs/loggers';

setEnableLogger(false);

logger.info('当前日志只会在控制台中输出！');
```

## 其他知识

### process.env.YUNFLY_LOGGER_DIR

自定义日志目录(可选)

```ts
// 通过 YUNFLY_LOGGER_DIR 环境变量自定义日志输出目录
process.env.YUNFLY_LOGGER_DIR = require('path').join(__dirname,'logs') 
```

### process.env.YUNFLY_CONSOLE_OUTPUT

控制台是否输出日志。

### process.env.YUNFLY_DISABLE_LOGGER

日志是否输出到文件中。

### process.env.YUNFLY_DEBUG

当使用 `debug` 进行日志打印时， 可以通过环境变量来控制打印的输出

> 开发环境有效

使用场景： 开发模式下，控制台输出的日志太多，可以手动控制输出日志信息。

```ts
process.env.YUNFLY_DEBUG = 'logger1';

// output: 【logger1】: logger1

process.env.YUNFLY_DEBUG = 'logger1,logger3';
/*
 * output:
 * 【logger1】: logger1
 * 【logger3】: logger3
 */
```

### process.env.YUNFLY_DEBUG_TYPE

当使用根据环境变量来控制日志输出时，我们可以决定是包含的还是输出，排查设置的才输出。

当前环境变量取值为：`include` 或 `exclude`

```ts
process.env.YUNFLY_DEBUG = 'logger1';
process.env.YUNFLY_DEBUG_TYPE = 'include';
// output: 【logger1】: logger1

process.env.YUNFLY_DEBUG = 'logger1';
process.env.YUNFLY_DEBUG_TYPE = 'exclude';
/*
 * output:
 * 【logger2】: logger2
 * 【logger3】: logger3
 */
```

### 通过配置控制日志输出内容

```ts title = 'src/config/config.local.ts'
config.setEnv = {
  'YUNFLY_DEBUG': 'client-request',
  'YUNFLY_DEBUG_TYPE': 'exclude', // exclude | include
};
```

> 备注： 需要安装 `@yunflyjs/yunfly-plugin-set-env` 插件。

### 通过环境变量控制日志输出

```ts title = 'src/app.ts'
// 在 beforeStart 生命周期中设置环境变量
process.env.YUNFLY_DEBUG_TYPE = 'exclude';
process.env.YUNFLY_DEBUG = 'client-request';
```

- `YUNFLY_DEBUG` 可选日志参数说明

| 名称 | 说明 |
| ------ | ------ |
| `client-request` | `client` 端(例如：浏览器)向 `BFF`发起的 `HTTP` 请求链路日志 |
| `http-request` | `BFF` 发起的 `HTTP` 请求链路日志 |
| `grpc-request` |  `BFF` 发起的`RPC` 请求链路日志 |
| `grpc-restart` | `RPC` 请求过程中的 `init` 和 `restart` 日志 |
| `service-crypto` | `RPC` 请求过程中的 `init` 和 `restart` 日志 |

- `YUNFLY_DEBUG_TYPE` 参数说明

`YUNFLY_DEBUG_TYPE` 的值为 `exclude` 或者 `include`。 当值为 `include` 时，表示只输出 `YUNFLY_DEBUG` 定义的日志。
