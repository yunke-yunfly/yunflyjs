export interface AnyOpton {
  [props: string]: any;
}

export type TLogType = 'log' | 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'access';
export type TLogFilter = (logType?: TLogType, ...optionalParams: any[]) => any[];
export type ArgsHandleType = (key: string, args: any[]) => any[];

// console暴露两个全局方法
declare global {
  interface Console {
    access(message?: any, ...optionalParams: any[]): void;
    log1(message?: any, ...optionalParams: any[]): void;
  }
}

export interface OptionConfig {
  color?: boolean | string;
  onlySign?: boolean;
  prefix?: string;
  window?: boolean;
  logFilter?: TLogFilter;
  argumentsHandle?: ArgsHandleType;
}
