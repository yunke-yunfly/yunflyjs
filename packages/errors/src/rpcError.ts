import { YunkeError, YunkeErrorOptions } from './yunkeError';

const defaultRpcCode = -1;

interface RpcErrorInfo {
  host: string;
  serviceCode: string;
  target: string;
  details: string;
  statusDetails: any;
  method: string;
  customField?: any;
  message?: any;
}

export class RpcError extends YunkeError {
  public host: string;
  // 保证兼容性，需要把原有的错误信息保留
  public serviceCode: string | number;
  public target: string;
  public details: string;
  public statusDetails: any;
  public customMessage: boolean = false;
  public message: string = '服务器异常，请重试'
  public customField?: any;
  method: string;

  constructor(options?: YunkeErrorOptions & RpcErrorInfo, message?: string) {
    super(options);
    this.httpCode = this.httpCode ?? 500;
    if (typeof options === 'object') {
      this.host = options.host;
      this.serviceCode = options.serviceCode;
      this.target = options.target;
      this.statusDetails = options.statusDetails || options.message;
      this.messageDetail = options.message || options.statusDetails;
      this.details = options.details;
      this.code = options.serviceCode || this.code || defaultRpcCode;
      this.method = options.method;
      this.customField = options.customField;
    }

    if (message) {
      this.customMessage = true;
      this.message = message;
    }
  }
}
