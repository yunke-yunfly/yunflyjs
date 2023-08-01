# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### [0.0.10](https://github.com/yunke-yunfly/yunflyjs/compare/v0.0.9...v0.0.10) (2023-08-01)


### Features

* 当有controllers类型插件中间件时 优先注册插件中的controller ([7017f7c](https://github.com/yunke-yunfly/yunflyjs/commit/7017f7c591339433c884f1b36c7c3e7961db04c3))



### [0.0.9](https://github.com/yunke-yunfly/yunflyjs/compare/v0.0.8...v0.0.9) (2023-07-25)


### Bug Fixes

* 修复对config.logFilter的支持(过滤日志能力) ([162a6f2](https://github.com/yunke-yunfly/yunflyjs/commit/162a6f228bc50e37d8f17cce1b374e101b5c6953))



### [0.0.8](https://github.com/yunke-yunfly/yunflyjs/compare/v0.0.7...v0.0.8) (2023-07-12)


### Features

* built in body and error plugins ([d7e49e1](https://github.com/yunke-yunfly/yunflyjs/commit/d7e49e12f0d97c45fb7a48f46fbcfcd520389a8a))



### [0.0.7](https://github.com/yunke-yunfly/yunflyjs/compare/v0.0.6...v0.0.7) (2023-07-12)


### Features

* plugin support loading master file ([993ec35](https://github.com/yunke-yunfly/yunflyjs/commit/993ec35322dd291c7aa9f3874547c5f08ed3b330))



### [0.0.6](https://github.com/yunke-yunfly/yunflyjs/compare/v0.0.5...v0.0.6) (2023-07-10)


### Features

* 锁定所有依赖版本 ([264ba4d](https://github.com/yunke-yunfly/yunflyjs/commit/264ba4d32980cd999a5666e46045ce6b5821de44))



### [0.0.5](https://github.com/yunke-yunfly/yunflyjs/compare/v0.0.4...v0.0.5) (2023-07-04)


### Bug Fixes

* 修复cluster模型下进程间socket直连初始化两次问题 ([a06308f](https://github.com/yunke-yunfly/yunflyjs/commit/a06308f05bd4d347ae61ae60d06f63c24803eca8))



### [0.0.4](https://github.com/yunke-yunfly/yunflyjs/compare/v0.0.3...v0.0.4) (2023-07-04)


### Features

* 优化cluster模型socket直连导出函数 ([4e385fd](https://github.com/yunke-yunfly/yunflyjs/commit/4e385fd4a03b6b607a9cf2ab9b51dbcfca99f3af))



### [0.0.3](https://github.com/yunke-yunfly/yunflyjs/compare/v0.0.2...v0.0.3) (2023-07-03)


### Features

* cluster 模型支持进程间socket通信 ([4b06b6e](https://github.com/yunke-yunfly/yunflyjs/commit/4b06b6e4b48ca2d32eb9f04f9a547d2dba0c5017))



### [0.0.2](https://github.com/yunke-yunfly/yunflyjs/compare/v0.0.1...v0.0.2) (2023-06-20)


### Features

* after 插件支持server参数 ([7ab1ebe](https://github.com/yunke-yunfly/yunflyjs/commit/7ab1ebe3d75462d5ba73555bcb0772bf15fed52f))


### Bug Fixes

* 修复合并config时数组重复问题 ([1a8f38b](https://github.com/yunke-yunfly/yunflyjs/commit/1a8f38baac7dcd4e190aef27abed5bd90494b616))



### [0.0.1](https://github.com/yunke-yunfly/yunflyjs/compare/v0.0.1-beta.15...v0.0.1) (2023-05-23)


### Features

* 剔除.env文件 ([e8d6a77](https://github.com/yunke-yunfly/yunflyjs/commit/e8d6a7735d3c875bca69d80bd71c6e935cd96247))



### [0.0.1-beta.15](https://github.com/yunke-yunfly/yunflyjs/compare/v0.0.1-beta.14...v0.0.1-beta.15) (2023-04-20)


### Features

* 更新框架描述字段 ([0a8d733](https://github.com/yunke-yunfly/yunflyjs/commit/0a8d7331b6a4332c857f97106f847b185266a209))
* 新增 RUNTIME_ENV 环境变量 ([05b8eba](https://github.com/yunke-yunfly/yunflyjs/commit/05b8ebaae3e34fc6b0524215de7e72e89c55a582))
* 优化 剔除所有内置插件 只留初始化核心逻辑 ([a2c57aa](https://github.com/yunke-yunfly/yunflyjs/commit/a2c57aa638c2fd38d56b31f3393d81fc5823dc43))



### [0.0.1-beta.14](https://github.com/yunke-yunfly/yunflyjs/compare/v0.0.1-beta.13...v0.0.1-beta.14) (2023-04-18)


### Features

* 更新版本 ([9c3b6f2](https://github.com/yunke-yunfly/yunflyjs/commit/9c3b6f2d1f1758533fb5b8998701a04efd2d1c87))
* 修复 metadata 插件 ([d9e3737](https://github.com/yunke-yunfly/yunflyjs/commit/d9e373781245b3d98ff817a4c353fb5a09fa51d7))
* 修复 metadata 插件 ([3eb8868](https://github.com/yunke-yunfly/yunflyjs/commit/3eb8868fc929d01a81574b933bbe08de4e31bfc9))



### [0.0.1-beta.13](https://github.com/yunke-yunfly/yunflyjs/compare/v0.0.1-beta.11...v0.0.1-beta.13) (2023-04-18)


### Features

* 忽略构建更改 ([ff846ba](https://github.com/yunke-yunfly/yunflyjs/commit/ff846ba55224ea217ae384a8e31b541a541617ae))
* 默认创建完成自动install ([d72fcf4](https://github.com/yunke-yunfly/yunflyjs/commit/d72fcf41695604099e37e4f3dca24aadbfa7110e))
* 增加 metadata 插件 ([f53a429](https://github.com/yunke-yunfly/yunflyjs/commit/f53a429aab2ccf1322be80a5be8701a923f91e4c))


### Bug Fixes

* 修复系统差异问题 ([3e00e60](https://github.com/yunke-yunfly/yunflyjs/commit/3e00e602404e75183fa6cb6d6a49cda2269adb45))



### [0.0.1-beta.12](https://github.com/yunke-yunfly/yunflyjs/compare/v0.0.1-beta.11...v0.0.1-beta.12) (2023-04-18)


### Features

* 忽略构建更改 ([ff846ba](https://github.com/yunke-yunfly/yunflyjs/commit/ff846ba55224ea217ae384a8e31b541a541617ae))
* 默认创建完成自动install ([d72fcf4](https://github.com/yunke-yunfly/yunflyjs/commit/d72fcf41695604099e37e4f3dca24aadbfa7110e))
* 增加 metadata 插件 ([f53a429](https://github.com/yunke-yunfly/yunflyjs/commit/f53a429aab2ccf1322be80a5be8701a923f91e4c))


### Bug Fixes

* 修复系统差异问题 ([3e00e60](https://github.com/yunke-yunfly/yunflyjs/commit/3e00e602404e75183fa6cb6d6a49cda2269adb45))




### [0.0.1-beta.11](https://github.com/yunke-yunfly/yunflyjs/compare/v0.0.1-beta.10...v0.0.1-beta.11) (2023-04-17)


### Features

* 新增yunfly脚手架 ([7217367](https://github.com/yunke-yunfly/yunflyjs/commit/7217367cfa38915a40aee7ac8347210bbc9d1d92))



### 0.0.1-beta.10 (2023-04-17)


### Features

* 新增yunfly脚手架 ([7779640](https://github.com/yunke-yunfly/yunflyjs/commit/7779640232fc424dbaf528e5f4217b6a1fc13947))
* 新增yunfly脚手架 ([74545f8](https://github.com/yunke-yunfly/yunflyjs/commit/74545f852da0a1514c6f5ef5dc251f038a51a0bb))
* add yunfly scaffold ([1d3efe0](https://github.com/yunke-yunfly/yunflyjs/commit/1d3efe0d80c1fc811b6635d601cdd3ee29453c72))
* init project ([c94d437](https://github.com/yunke-yunfly/yunflyjs/commit/c94d4372b6dacb189df8747e0879115d0629ca7c))
* logger 日志优化，支持自定义输出目录 ([24bb662](https://github.com/yunke-yunfly/yunflyjs/commit/24bb6622cb0047e290766f1f7a37981f0dd73784))



### 0.0.1-beta.10 (2023-04-17)


### Features

* add yunfly scaffold ([1d3efe0](https://github.com/yunke-yunfly/yunflyjs/commit/1d3efe0d80c1fc811b6635d601cdd3ee29453c72))
* init project ([c94d437](https://github.com/yunke-yunfly/yunflyjs/commit/c94d4372b6dacb189df8747e0879115d0629ca7c))
* logger 日志优化，支持自定义输出目录 ([24bb662](https://github.com/yunke-yunfly/yunflyjs/commit/24bb6622cb0047e290766f1f7a37981f0dd73784))



### 0.0.1-beta.9 (2023-04-17)


### Features

* add yunfly scaffold ([1d3efe0](https://github.com/yunke-yunfly/yunflyjs/commit/1d3efe0d80c1fc811b6635d601cdd3ee29453c72))
* init project ([c94d437](https://github.com/yunke-yunfly/yunflyjs/commit/c94d4372b6dacb189df8747e0879115d0629ca7c))
* logger 日志优化，支持自定义输出目录 ([24bb662](https://github.com/yunke-yunfly/yunflyjs/commit/24bb6622cb0047e290766f1f7a37981f0dd73784))



### [0.0.1-beta.8](https://github.com/yunke-yunfly/yunflyjs/compare/v0.0.1-beta.7...v0.0.1-beta.8) (2023-04-06)


### Features

* 使用淘宝镜像 ([939eb82](https://github.com/yunke-yunfly/yunflyjs/commit/939eb8261559ccbcba24ef22ff6e3c26e975eaef))



### [0.0.1-beta.7](https://github.com/yunke-yunfly/yunflyjs/compare/v0.0.1-beta.6...v0.0.1-beta.7) (2023-04-06)

**Note:** Version bump only for package yunflyjs





### [0.0.1-beta.6](https://github.com/yunke-yunfly/yunflyjs/compare/v0.0.1-beta.5...v0.0.1-beta.6) (2023-04-06)


### Features

* 使用npm镜像 ([5764507](https://github.com/yunke-yunfly/yunflyjs/commit/576450770d0dab6c2fe655ff6016b5658f2222f7))



### [0.0.1-beta.5](https://github.com/yunke-yunfly/yunflyjs/compare/v0.0.1-beta.4...v0.0.1-beta.5) (2023-04-06)


### Features

* license ([359234a](https://github.com/yunke-yunfly/yunflyjs/commit/359234a4e7a0637dc0204faa30f0f7c8450e5c42))



### [0.0.1-beta.4](https://github.com/yunke-yunfly/yunflyjs/compare/v0.0.1-beta.3...v0.0.1-beta.4) (2023-04-06)


### Bug Fixes

* 修复publish命令 ([792314f](https://github.com/yunke-yunfly/yunflyjs/commit/792314faa8407aec415417a607343b626ffce592))



### 0.0.1-beta.3 (2023-04-06)


### Features

* init project ([dc84965](https://github.com/yunke-yunfly/yunflyjs/commit/dc849654e51bd4bf4234c574099096a381448243))
