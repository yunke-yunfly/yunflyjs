import { getDefaultLogger, isProd, packagejson } from './util';
import { ArgsHandleType, OptionConfig, TLogFilter, TLogType } from './types';
const util = require('util');
const randomColor = require('randomcolor');
const chalk = require('chalk');

const consoleLog = isProd ? (process.env.CONSOLE_OUTPUT === 'true' ? true : false) : true;
console.access = console.log;
console.log1 = console.log;

const randomColorConfig = {
  luminosity: 'light',
};

const yunflyDebugType = {
  include: 'include', // 包含
  exclude: 'exclude', // 排除
};

const packageJson = packagejson();
const logger = getDefaultLogger(packageJson.name);

let logFilter: any;
let argumentsHandle: ArgsHandleType;
let enablelog4js: boolean = true;

export function setLogFilter(opt: TLogFilter): void {
  if (opt) { logFilter = opt; }
}

export function setArgsHandle(opt: ArgsHandleType) {
  if (opt) argumentsHandle = opt;
}

export function setEnableLog4js(opt: boolean) {
  enablelog4js = opt;
}

class Logger {
  [props: string]: any;

  constructor(option?: OptionConfig) {
    this.color_ = option?.color || '';
    this.onlySign_ = option?.onlySign || false;
    this.prefix_ = option?.prefix || '';
    this.window_ = option?.window || false;
    this.logFilter_ = option?.logFilter;
    this.argumentsHandle_ = option?.argumentsHandle;
    this.accessLogger = logger.accessLogger;
    this.errorLogger = logger.errorLogger;
    this.businessLogger = logger.infoLogger;
  }
  log(...args: any) {
    return this.logger('log', args);
  }
  trace(...args: any) {
    return this.logger('trace', args);
  }
  debug(...args: any) {
    return this.logger('debug', args);
  }
  info(...args: any) {
    return this.logger('info', args);
  }
  warn(...args: any) {
    return this.logger('warn', args);
  }
  error(...args: any) {
    return this.logger('error', args);
  }
  access(...args: any) {
    return this.logger('access', args);
  }
  color(opt?: string) {
    this.color__ = isProd ? '' : (opt || randomColor(randomColorConfig));
    return this;
  }
  onlySign() {
    this.onlySign__ = true;
    return this;
  }
  prefix(opt: string) {
    this.prefix__ = opt;
    return this;
  }
  window() {
    this.window__ = true;
    return this;
  }
  logFilter(opt: TLogFilter) {
    this.logFilter__ = opt;
    return this;
  }
  argumentsHandle(opt: ArgsHandleType) {
    this.argumentsHandle__ = opt;
    return this;
  }
  clean() {
    this.color__ = this.onlySign__ = this.prefix__ = this.window__ = this.logFilter__ = this.argumentsHandle__ = null;
    return this;
  }
  logger(key: TLogType, args: any[]) {
    const newLogFilter = this.logFilter__ || this.logFilter_ || logFilter;
    if (newLogFilter) {
      args = newLogFilter(key, ...args);
    }

    const prefix = this.prefix__ || this.prefix_;
    const onlySign = this.onlySign__ || this.onlySign_;
    if (prefix && !onlySign) {
      args.unshift(`【${prefix}】:`);
    }

    const newArgsHandle = this.argumentsHandle__ || this.argumentsHandle_ || argumentsHandle;
    if (newArgsHandle) {
      args = newArgsHandle(key, args);
    }

    const loggerfn = (args: any[]) => {
      if (process.env.DISABLE_LOG4JS || !enablelog4js) { return; }
      if (key === 'access') { this.accessLogger.info(args); }
      else if (key === 'error') { this.errorLogger.error(args); }
      else { this.businessLogger.info(args); }
    };

    // eslint-disable-next-line promise/catch-or-return
    Promise.resolve(loggerfn(args));

    // console
    if (isProd) {
      if (this.window__ || this.window_) {
        // eslint-disable-next-line promise/catch-or-return
        Promise.resolve(process.stderr.write(`${util.format(...args)}\n`));
      }
    }
    else {
      const color = this.color__ || this.color_ || '';
      const log = () => {
        color
          ? process.stderr.write(chalk.hex(color)(`${util.format(...args)}\n`))
          : console.log1(...args);
      };
      if (process.env.YUNFLY_DEBUG) {
        const debugs = process.env.YUNFLY_DEBUG.split(',');
        const prefix = this.prefix__ || this.prefix_;
        if (
          debugs.includes('*') ||
          (debugs.includes(prefix) &&
            (process.env.YUNFLY_DEBUG_TYPE || 'include') === yunflyDebugType.include) ||
          (!debugs.includes(prefix) && process.env.YUNFLY_DEBUG_TYPE === yunflyDebugType.exclude)
        ) {
          log();
        }
      } else {
        log();
      }
    }

    this.clean();
    return this;
  }
}

export function debug(prefix?: string | OptionConfig, option?: OptionConfig): Logger {
  let newPrefix: string = prefix as string;
  let newOption = option || {};

  if (typeof prefix === 'string') {
    newPrefix = prefix;
  } else if (typeof prefix === 'object') {
    newPrefix = prefix.prefix || '';
    newOption = prefix;
  }

  const color: string =
    option?.color
      ? typeof option.color === 'string'
        ? option.color
        : randomColor(randomColorConfig)
      : '';

  return new Logger({ ...newOption, prefix: newPrefix, color });
}

export default new Logger();

// console 日志代理
const replaceOrigin = (
  key: TLogType,
  logger: any,
  logFilter?: TLogFilter,
) => {
  const origin = (console as any)[key];
  (console as any)[key] = function () {
    let argumentsRes = [...arguments];
    if (process.env.DISABLE_LOG4JS || !enablelog4js) {
      origin.call(this, ...argumentsRes);
      return;
    }
    if (logFilter) {
      argumentsRes = logFilter(key, ...argumentsRes);
    }
    if (argumentsRes && argumentsRes.length > 0) {
      (logger as any)[(key === 'log' || key === 'access') ? 'info' : key].call(logger, argumentsRes);
      if (consoleLog) {
        origin.call(this, ...argumentsRes);
      }
    }
  };
};

function initConsoleConfig(options: { logger: any; logFilter?: TLogFilter }) {
  const { logger, logFilter } = options;
  ['log', 'trace', 'debug', 'info', 'warn'].forEach((key) => {
    replaceOrigin(key as TLogType, logger.infoLogger, logFilter);
  });
  replaceOrigin('access', logger.accessLogger, logFilter);
  replaceOrigin('error', logger.errorLogger, logFilter);
}

// 初始化 console 日志代理
initConsoleConfig({ logger, logFilter });
