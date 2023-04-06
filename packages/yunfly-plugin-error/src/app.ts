import { ValidationError } from 'class-validator';
import ErrorPlugin from './lib';
import { ErrorOption } from './types';

export { errorResponse } from './middleware/YunflyPluginErrorMIddleware';
export { ErrorConfig } from './types';

export default function YunflyErrorPlugin({ koaApp, pluginConfig }: ErrorOption): void {
  ErrorPlugin(koaApp, pluginConfig);
}

// 用于重新组装error信息，处理class-validator错误，并且不影响其他错误
export function customErrorHandle(err: any): any {
  if (Array.isArray(err.errors) && err.errors.length && err.errors[0] instanceof ValidationError) {
    const result: any = { msg: '', msg_detail: [] };
    err.errors.forEach((item: ValidationError, index: number) => {
      if (index === 0) {
        result.msg = Object.values(item.constraints || {}).join(',');
      }
      result.msg_detail.push({
        property: item.property,
        details: item.constraints,
      });
    });
    err.messageDetail = result.msg_detail;
    err.message = result.msg;
  }
  return err;
}

