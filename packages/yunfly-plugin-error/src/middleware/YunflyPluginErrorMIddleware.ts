import { IYunkeError, InternalServerError, RpcError } from '@yunflyjs/errors';
import { Context } from 'koa';
import { KoaMiddlewareInterface, Middleware } from '@yunflyjs/routing-controllers';
import logger from '@yunflyjs/loggers';
import { customErrorHandle } from '../app';
import { AnyOptionConfig, ErrorConfig } from '../types';
import { getErrorCode, isObject } from '../utils';

/**
 * error Response
 *
 * @param {*} err
 * @param {Context} ctx
 */
export const errorResponse = (err: any, ctx: Context): any => {
  if (!ctx) {
    return;
  }

  // 使用自用户定义的error信息
  const errorConfig = (ctx.config.error || {}) as ErrorConfig;

  const method = ctx.req.method;
  const request = method === 'POST' ? (ctx.request as any).body : (ctx.request as any).query;

  // 判断是否打印header信息头
  const logConfig = ctx.config.log || {};

  if (!errorConfig.customErrorHandle || typeof errorConfig.customErrorHandle !== 'function') {
    errorConfig.customErrorHandle = customErrorHandle;
  }

  try {
    err = errorConfig.customErrorHandle(err, ctx) || err;
  } catch (error) {
    logger.error(error);
  }

  const errorInfo = getErrorInfo(err, errorConfig);
  const errorLog: AnyOptionConfig = {
    msg: 'Request error',
    url: ctx.req.url,
    method,
    request: { ...request },
    error: err,
  };
  if (logConfig.headers) errorLog.headers = ctx.request.headers;

  if (errorConfig.customError && errorConfig.useYunflyLog) {
    logger.prefix('client-request').onlySign().error(errorLog);
  }

  if (errorConfig.customError && typeof errorConfig.customError === 'function') {
    errorConfig.customError(err, ctx);
    return;
  }

  logger.prefix('client-request').onlySign().error(errorLog);

  // http 状态码
  const httpCode = getHttpCode(errorConfig, err);
  if (httpCode) {
    ctx.status = httpCode;
  }

  const messageDetail = getMsgDetail(errorInfo);

  // 响应结果
  const body: Record<string, any> = {
    code: getErrorCode(err, errorConfig.errCode),
    msg: getMessage(errorInfo),
  };

  // 判断是否显示详情
  if (messageDetail && errorConfig.showMessageDetail) {
    body.msg_detail = messageDetail;
  }

  ctx.body = body;
};

const isValidHttpCode = (code: any) => Number(code) >= 100 && Number(code) < 600;

function getHttpCode(errorConfig: ErrorConfig, err: any): undefined | number {
  if (errorConfig.enableHttpCode) {
    const defaultHttpCode = 500;

    // 如果有映射，取映射里的值
    if (isObject(errorConfig.errCode) && errorConfig.errCode[err.code]) {
      const res = errorConfig.errCode[err.code];
      if (isValidHttpCode(res)) return Number(res);
    }

    // 如果 Error 类的 httpCode 有值，则取 Error 类的 http code
    if (isObject(err) && isValidHttpCode(err.httpCode)) return Number(err.httpCode);

    // 否则返回默认的 500
    return defaultHttpCode;
  }
  return undefined;
}

function getMsgDetail(errorInfo: string | IYunkeError) {
  return typeof errorInfo === 'object' ? errorInfo.messageDetail : null;
}

// 获取 message 信息
function getMessage(err: any) {
  return typeof err === 'string' ? err : err.message || '服务异常,请稍后重试！';
}

// 获取错误信息
function getErrorInfo(err: any, errConfig: ErrorConfig): string | IYunkeError {
  if (typeof err === 'string') return err;

  // 对内部错误的拦截
  if (err instanceof TypeError) {
    err = new InternalServerError(err);
  }

  // 自动为 rpc 进行拦截
  if (!(err instanceof RpcError) && err.target === 'grpc') {
    err = new RpcError(err);
  }

  // 对 rpc 单独处理
  if (err.target === 'grpc' && !err.customMessage && errConfig.useRpcErrorMessage !== false) {
    err.message = err.details;
  }

  const res: IYunkeError & { host?: string } = {
    name: err.name,
    code: err.code,
    message: err.message,
    stack: err.stack,
  };

  if (err.host) {
    res.host = err.host;
  }

  if (err.messageDetail && err.message !== err.messageDetail) {
    res.messageDetail = err.messageDetail;
  }
  return res;
}

@Middleware({ type: 'before', priority: 19 })
export default class YunflyPluginErrorMIddleware implements KoaMiddlewareInterface {
  async use(context: Context, next: (err?: any) => Promise<any>): Promise<any> {
    const errorConfig = context.config.error || {};

    if (!errorConfig.enable) {
      return await next();
    }

    try {
      await next();
    } catch (err: any) {
      errorResponse(err, context);
    }
  }
}
