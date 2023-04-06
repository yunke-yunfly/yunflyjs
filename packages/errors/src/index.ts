/**
 * code 规则说明
 *
 * 规则 1：http 相关 code
 *    http 相关 code 使用原始 code，
 *    例如 400、401、403、500、503 等。
 *
 * 规则 2：yunfly 框架及周边生态
 *    从 10000 开头，每个应用占 100 个间隔，
 *    例如 redis 错误为为 10100 - 10199，默认值是 10100
 *
 * 规则 3：用户自定义错误
 *    严格上，用户自定义错误只要不和上述两种规则冲突即可，
 *    目前规划为 40000 开始。
 */

export * from './yunkeError';
export * from './httpError';
export * from './rpcError';
export * from './yunflyError';
