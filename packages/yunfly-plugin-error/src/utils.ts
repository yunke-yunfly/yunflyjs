import { ErrorCode } from './types';

// errorConfig?.errCodeMap，支持 boolean 和 数组 类型
// 值为 false 时，错误码依然是 errCode 对应的值
// 值为 true 时，使用 Error 类对应的值
// 值为 数组 时，当遇到数组内的 code 时，则返回相应的 code
export function getErrorCode(yunkeError: any, errorCode?: ErrorCode) {
  const defaultCode = 2;

  // 如果为数字，则始终使用此数字
  if (typeof errorCode === 'number') return errorCode;

  // 首先确保 error 类的 code 有值
  if (isObject(yunkeError) && !isEmpty(yunkeError.code)) {
    // 如果 errorCode 为 true，则使用 error 类的 code
    if (errorCode === true) {
      return getNumberValue(yunkeError.code);
    }

    // 如果 yunkeError 不是对象或者没有 code 属性，则返回默认值
    // errCode: {
    //   '*': 2, // * 表示通用匹配
    //   '401': 401, // 当 YunkeError 类的 code 为 401 时，返回 code 为 401
    //   '2000021': 401, // 当 rpc code 为 2000021 时，返回 code 为 401
    // },
    if (isObject(errorCode)) {
      const code = errorCode[String(yunkeError.code)];
      if (!isEmpty(code)) return code; // 如果有，则返回映射值
      if (!isEmpty(errorCode['*'])) return errorCode['*']; // 如果通用匹配存在，则返回通用匹配对应的值

      // 否则返回错误类自身的 code
      return getNumberValue(yunkeError.code);
    }
  }

  // 其他情况下返回默认值
  return isObject(errorCode) && errorCode['*'] ? errorCode['*'] : defaultCode;
}

// 获取配置的数字类型
export function getConfigErrorCodeNumber(errorCode?: ErrorCode) {
  const defaultCode = 2;
  if (typeof errorCode === 'number') return errorCode;
  if (isObject(errorCode) && errorCode['*']) return errorCode['*'];
  return defaultCode;
}

export function isEmpty(val: unknown): boolean {
  if(!val) {
    return true;
  }
  if (typeof(val) === 'number') {
    return false;
  }
  return isNaN(Number(val));
}

export function isObject(val: unknown): val is Record<any, any> {
  return !!(val && typeof val === 'object');
}

// 获取数字值，例如 "123123" => 123123
export function getNumberValue(val: any) {
  if (
    typeof val === 'string' &&
    String(parseInt(val)) === val &&
    Number.isSafeInteger(parseInt(val))
  )
    return parseInt(val);
  return val;
}
