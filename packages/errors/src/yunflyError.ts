import { YunkeError, YunkeErrorOptions } from './yunkeError';

// yunfly 框架自身的错误，code 范围为：10000 ~ 100099
export class YunflyError extends YunkeError {
  constructor(options?: YunkeErrorOptions) {
    super(options);
    this.code = this.code ?? 10000;
    this.message = this.message || 'Yunfly 框架内部错误';
  }
}

// apollo 错误，code 范围为：10100 ~ 100199
export class ApolloError extends YunkeError {
  constructor(options?: YunkeErrorOptions) {
    super(options);
    this.code = this.code ?? 10100;
    this.httpCode = this.httpCode ?? 500;
    this.message = this.message || '服务器异常，请重试';
  }
}

// redis 错误，code 范围为：10200 ~ 100299
export class RedisError extends YunkeError {
  constructor(options?: YunkeErrorOptions) {
    super(options);
    this.code = this.code ?? 10200;
    this.httpCode = this.httpCode ?? 500;
    this.message = this.message || '服务器异常，请重试';
  }
}

// ectd 错误，code 范围为：10300 ~ 100399
export class EctdError extends YunkeError {
  constructor(options?: YunkeErrorOptions) {
    super(options);
    this.code = this.code ?? 10300;
    this.httpCode = this.httpCode ?? 500;
    this.message = this.message || 'Ectd 错误';
  }
}

// mysql 相关错误，code 范围为：10400 ~ 100499
export class MysqlError extends YunkeError {
  constructor(options?: YunkeErrorOptions) {
    super(options);
    this.code = this.code ?? 10400;
    this.httpCode = this.httpCode ?? 500;
    this.message = this.message || 'mysql 错误';
  }
}

// mongodb 相关错误，code 范围为：10500 ~ 100599
export class MongoDBError extends YunkeError {
  constructor(options?: YunkeErrorOptions) {
    super(options);
    this.code = this.code ?? 10500;
    this.message = this.message || 'MongoDB 错误';
  }
}

// grpc 相关错误，code 范围为：10600 ~ 100699
export class GrpcError extends YunkeError {
  constructor(options?: YunkeErrorOptions) {
    super(options);
    this.code = this.code ?? 10600;
    this.httpCode = this.httpCode ?? 500;
    this.message = this.message || 'grpc 错误';
  }
}
