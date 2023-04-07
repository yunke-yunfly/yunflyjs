import { YunkeError, YunkeErrorOptions } from './yunkeError';

// 用户参数错误
export class BadRequestError extends YunkeError {
  constructor(options?: YunkeErrorOptions) {
    super(options);
    this.code = this.code ?? 400;
    this.httpCode = this.httpCode ?? 400;
    this.message = this.message || '参数错误，请检查';
  }
}

// 用户未登录
export class UnauthorizedError extends YunkeError {
  constructor(options?: YunkeErrorOptions) {
    super(options);
    this.code = this.code ?? 401;
    this.httpCode = this.httpCode ?? 401;
    this.message = this.message || '请重新登陆';
  }
}

// 用户无权限
export class ForbiddenError extends YunkeError {
  constructor(options?: YunkeErrorOptions) {
    super(options);
    this.code = this.code ?? 403;
    this.httpCode = this.httpCode ?? 403;
    this.message = this.message || '没有权限访问该数据';
  }
}

// 找不到结果或者资源
export class NotFoundError extends YunkeError {
  constructor(options?: YunkeErrorOptions) {
    super(options);
    this.code = this.code ?? 404;
    this.httpCode = this.httpCode ?? 404;
    this.message = this.message || '找不到资源';
  }
}

// 方法不允许
// 当定义的是 POST 方法，但用户是通过 GET 方法请求，就应该抛这个错
export class MethodNotAllowedError extends YunkeError {
  constructor(options?: YunkeErrorOptions) {
    super(options);
    this.code = this.code ?? 405;
    this.httpCode = this.httpCode ?? 405;
    this.message = this.message || '调用方法错误';
  }
}

// 请求次数过多
export class TooManyRequestsError extends YunkeError {
  constructor(options?: YunkeErrorOptions) {
    super(options);
    this.code = this.code ?? 429;
    this.httpCode = this.httpCode ?? 429;
    this.message = this.message || '请求次数过多';
  }
}

// 代码不严谨导致的错误
// 例如 undefined 没有 xx 方法
export class InternalServerError extends YunkeError {
  constructor(options?: YunkeErrorOptions, message?: string) {
    super(options);
    this.code = this.code ?? 500;
    this.httpCode = this.httpCode ?? 500;
    this.messageDetail = this.message;
    this.message = message ?? '服务器异常，请重试';
  }
}

// 网关错误
export class BadGatewayError extends YunkeError {
  constructor(options?: YunkeErrorOptions) {
    super(options);
    this.code = this.code ?? 502;
    this.httpCode = this.httpCode ?? 502;
    this.message = this.message || '服务器异常，请重试';
    this.messageDetail = this.messageDetail ?? '网关错误';
  }
}

// 服务不可用
export class ServiceUnavailableError extends YunkeError {
  constructor(options?: YunkeErrorOptions) {
    super(options);
    this.code = this.code ?? 503;
    this.httpCode = this.httpCode ?? 503;
    this.message = this.message || '服务器异常，请重试';
    this.messageDetail = this.messageDetail ?? '服务不可用';
  }
}

// 网关超时
export class GatewayTimeoutError extends YunkeError {
  constructor(options?: YunkeErrorOptions) {
    super(options);
    this.code = this.code ?? 504;
    this.httpCode = this.httpCode ?? 504;
    this.message = this.message || '服务器异常，请重试';
    this.messageDetail = this.messageDetail ?? '网关超时';
  }
}
