
export interface IYunkeError {
  // 错误名
  name: string;
  // HTTP 状态码
  httpCode?: number;
  // 自定义错误码
  code?: number | string;
  // 错误信息
  message?: string;
  // 错误详情
  // 因为有些信息不能返回给用户，但是需要记录到阿里云，通过此属性报错相关信息
  messageDetail?: string;
  // 错误堆栈信息
  stack?: string;
}

export type YunkeErrorOptions = string | Omit<IYunkeError, 'name'>;

// 所有 HTTP 相关错误的基类
// 所有属性都可以有用户自定义传入
export class YunkeError extends Error implements IYunkeError {
  // http 状态码
  public httpCode: number;
  // 自定义状态码
  public code: number | string;
  // 错误信息
  public message: string;
  // 错误堆栈
  public stack?: string;
  // 详细信息
  public messageDetail?: any;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  get name() {
    return this.constructor.name;
  }

  constructor(options?: YunkeErrorOptions) {
    super(typeof options === 'string' ? options : options?.message);
    if (!options) return;

    const obj = typeof options === 'string' ? { message: options } : options;

    if (obj.httpCode) {
      this.httpCode = obj.httpCode;
    }

    if (obj.code !== undefined && obj.code !== null) {
      this.code = obj.code;
    }

    if (obj.message) {
      this.message = obj.message;
    }

    if (obj.stack) {
      this.stack = obj.stack;
    }

    if (obj.messageDetail) {
      this.messageDetail = obj.messageDetail;
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      messageDetail: this.messageDetail,
    };
  }
}
