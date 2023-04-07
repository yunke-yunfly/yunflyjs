# yunfly-cluster

yunfly 框架内置多进程模型, cluster 模型参考了egg cluster 模型。

```txt
                  ┌─────────────────────┐       ┌─────────────────────┐
                  │          app        │  ---- │        alone        │    
                  └─────────────────────┘       └─────────────────────┘
                              |
                              |    
                  ┌─────────────────────┐   
                  │          master     │    
                  └─────────────────────┘  
                 /       /    |      \     \
              /         /     |       \       \
           /           /      |        \         \
        /             /       |         \           \
┌───────┐    ┌───────┐     ┌───────┐    ┌───────┐    ┌───────┐ 
│ worker│    │ worker│     │ worker│    │ worker│    │ worker│   ......
└───────┘    └───────┘     └───────┘    └───────┘    └───────┘
```

## cluster模式启动说明

> * 先启动主进程`app进程`  
> * `app进程`启动成功，之后启动`master进程`  
> * master进程启动成功之后使用 child_process模块 `fork` `alone进程`  
> * `alone 进程`启动成功之后 通知 `master进程`，master进程再 `fork` 多个worker进程  
> * 所有`worker进程`启动成功之后通知`app进程` `service服务启动成功`  
> * 当捕捉到 `disconnect` `exit` `unexpectedExit` 事件时，先优雅的关闭异常进程（该进程不再接收新的请求，处理完逻辑之后再关闭进程），`master进程`重新fork一个新的`worker进程`，使工作进程始终保持不变。并通知app进程。  
> * 当捕获到`exit` `unexpectedExit`事件时发现活着的`worker进程`数为0，app会通知`master进程`在`limit时间内`（即：允许refork的最长时间）进行refork新的worker进程。如果limit时间内，app进程检查保持活跃的worker进程还是为0，则退出所有进程并关掉server服务。  
> * app进程每隔10秒会进行存活worker进程状态的自检，如果发现所有活跃的worker进程数为0,则退出server服务。  

## 使用

### 一： 安装依赖

```js
yarn add @yunflyjs/yunfly
```

### 二： config 配置中心中 cluster 配置

```js
// config.default.ts 中新增cluster配置项

// cluster config
config.cluster = {
  enable: true,
  count: 4,   // 此处只对生产环境生效，开发环境始终为1个进程
}

```

### cluster 配置项说明

| 字段 | 类型 | 必选 | 说明 |
| ------ | ------ |------ |------ |
| enable | `boolean` | 是 | 是否开启集群环境，不开启则保持以前状态 |
| exec | `string` | 是 | cluster运行脚本路径 |
| alone | `string` | 否 | 开启alone独立进程的运行脚本路径 |
| count | `number` |  否 | worker进程数（默认开发环境1个进程，生产环境4个进程） |
| limit | `number` | 否 | 当进程崩溃之后自动重复重启进程时间，超出时间未启动成功则停止重启（单位s，默认60） |
| env | `Object` |  否 | cluster进程能获取到的环境env变量，（默认 process.env） |
| title | `string` |  否 | cluster集群组名称 （默认： yunfly-{{package.name}}） |
| refork | `boolean` |  否 | wroker进程异常退出时，是否重新refork一个worker进程 |

## Alone 进程的用法

* 在`根目录src`下面`创建alone文件夹`

* 在`src/alone` 里面新增的文件都会在`alone进程中`执行

* 案例： 在alone进程中创建一个定时器任务

```ts
// 1、新增setInterval.ts文件， 文件内容如下

// 2、src/alone/setInterval.ts

export default function Alone(config: any) {
  let i = 0
  setInterval(() => {
    console.log('console alone worker msg:', i++)
  }, 3000)
}
```

* 备注：

> alone文件夹下可以创建多个文件任务
> 文件必须以函数形式进行导出

* alone进程注意点：

1. 由于 App Worker 依赖于 Alone，所以必须等 Alone 初始化完成后才能 fork App Worker  
2. Alone 虽然是 App Worker 的『小秘』，但是业务相关的工作不应该放到 Alone 上去做，不然把她累垮了就不好了  
3. 由于 Alone 的特殊定位，我们应该保证它相对稳定。当它发生未捕获异常，框架不会像 App Worker 一样让他退出重启，而是记录异常日志、报警等待人工处理  

## Master VS Alone VS Worker

当一个应用启动时，会同时启动这三类进程。

| 类型 | 进程数量 | 作用 | 稳定性 | 是否运行业务代码 |
| ------ | ------ |------ | ------ | ------ |
| Master | 1 | 进程管理，进程间消息转发 |  非常高 | 否  |
| Alone | 1 | 后台运行工作（长连接客户端） |  高 | 少量  |
| Worker | n | 执行业务代码 | 一般  |  是 |
  
## worker进程说明

1. Worker 进程，顾名思义就是干活的『工人』。它们接收请求，对外提供服务
2. Worker 进程负责处理真正的用户请求和定时任务的处理。而 yunfly 的定时任务也提供了只让一个 Worker 进程运行的能力，所以能够通过定时任务解决的问题就不要放到 Alone 上执行。
3. Worker 运行的是业务代码，相对会比 Alone 和 Master 进程上运行的代码复杂度更高，稳定性也低一点，当 Worker 进程异常退出时，Master 进程会重启一个 Worker 进程。

## alone进程说明

1. 在大部分情况下，我们在写业务代码的时候完全不用考虑 Alone 进程的存在，但是当我们遇到一些场景，只想让代码运行在一个进程上的时候，Agent 进程就到了发挥作用的时候了。
2. 由于 Alone 只有一个，而且会负责许多维持连接的脏活累活，因此它不能轻易挂掉和重启，所以 Alone 进程在监听到未捕获异常时不会退出，但是会打印出错误日志，我们需要对日志中的未捕获异常提高警惕。
  
## 进程间通信机制说明

* 进程说明

1. `worker`进程是node.js模块中的`cluster fork出来的worker进程`，因此它可以和app进程进行通信
2. `alone`进程是使用node.js模块中的`child_process fork出来的worker进程`，因此它也可以和app进程进行通信
3. 因为进程间是独立的，worker进程和alone进程也没有父子级关系，因此`它们之间不能相互通信`。要做到相互通信需要`通过app进程进行转发`，转发规则如下。

### worker进程给alone进程发送消息

```ts
// worker 进程代码 发送消息
const sendmessage = require('sendmessage');

sendmessage(process,{
  action: 'worker-to-alone',
  from:'worker',
  to: 'alone',
  data: 'from worker msg to alone process'
})

// alone 进程代码 接受消息
process.on('message',(msg) => {
  const {action,from,to,data} = msg || {}
  if(action === 'worker-to-alone' && from === 'worker' && to === 'alone') {
    console.log('received msg from worker.msg:',msg)
  }
})

```

| 字段 | 类型 | 说明 |
| ------ | ------ |------ |
| action | `string` | 自定义事件名称（可随意自定义） |
| from | `string` | 值为 `worker`， 标识消息来源进程 |
| to | `string` | 值为 `alone`, 标识接受进程 |
| data | `any` | 需要发送的消息 |

### alone进程给worker进程发送消息

```ts
// alone 进程代码 发送消息
const sendmessage = require('sendmessage');

sendmessage(process,{
  action: 'alone-to-worker',
  from:'alone',
  to: 'worker',
  type: 'worker',
  data: 'from alone msg to worker process'
})

// worker 进程代码 接受消息
process.on('message',(msg) => {
  const {action,from,to,data} = msg || {}
  if(action === 'alone-to-worker' && from === 'alone' && to === 'worker') {
    console.log('received msg from worker.msg:',msg)
  }
})
```

| 字段 | 类型 | 说明 |
| ------ | ------ |------ |
| action | `string` | 自定义事件名称（可随意自定义） |
| from | `string` | 值为 `alone`， 标识消息来源进程 |
| to | `string` | 值为 `worker`, 标识接受进程 |
| type | `string` | 值为 `worker或all`, worker: 表示消息随机发送给一个worker进程， all: 表示消息发送给所有worker进程 （默认： worker） |
| data | `any` | 需要发送的消息 |
  
## 随机选择一个worker执行任务

在cluster集群模式下，我们如果只需要一个worker执行某一项任务（由于进程是独立的，默认情况下所有worker进程都会执行）时，你可以按照以下文档进行操作。

说明：
> worker进程是master随机选择的一个进程

### 1、 监听 worker 的 message 事件

```ts
const cluster = require('cluster')


cluster.worker.on('message',(msg: {[props:string]: any })=>{
  // do something
})

```

### 2、 确认是app进程发来的信息，并且是random-worker事件时才执行我们的任务

```ts

cluster.worker.on('message',(msg: {[props:string]: any })=>{
  const { from, to, action, worker_pid } = msg || {}
  const now_worker_pid = cluster.worker.process.id

  if (
      from === 'app' &&                 // 确保是app进程发来的消息
      to === 'worker' &&                // 确保是发给worker进程的
      action === 'random-worker' &&     // 确保是随机选择一个worker执行的事件
      now_worker_pid === worker_pid     // 确保当前worker是app进程选中的进程
    ) {
      // now you can doing something here what you want to do.
  }
})

```
  
## 开发环境下的reload策略

> 1、开发环境下，worker进程数始终为1，不能更改
> 2、开发环境下，不启用refork功能 （即：worker异常退出之后不进行fork新的worker）
> 3、开发环境reload模式下，只对worker进行进行reload，主进程master 和app进程不进行重启，减少重启耗时
> 4、开发模式下，不停的更改文件时，触发机制有默认500毫秒的延迟时间，以防止不停重启（次时间可以调整： 配置 cluster.reloadDelay 即可）
