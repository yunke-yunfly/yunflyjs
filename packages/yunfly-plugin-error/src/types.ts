import { KoaApp } from '@yunflyjs/yunfly-core';
import { IYunkeError } from '@yunflyjs/errors';

export interface ErrorOption {
  koaApp: KoaApp;
  pluginConfig: ErrorConfig;
}

export type Key = number | string;

export type ErrorCode = number | true | Record<Key, Key>;

export interface ErrorConfig {
  enable: boolean;
  errCode?: ErrorCode;
  showMessageDetail?: boolean;
  useRpcErrorMessage?: boolean;
  enableHttpCode?: boolean;
  useYunflyLog?: boolean;
  customError?: (err: any, ctx: any) => any;
  customErrorHandle?: (err: any, ctx: any) => IYunkeError; // 处理err后，继续往下走逻辑
  unhandledRejection?: (err: any, ctx?: any) => any;
  uncaughtException?: (err: any, ctx?: any) => any;
}

export interface AnyOptionConfig {
  [propsname: string]: any;
}
