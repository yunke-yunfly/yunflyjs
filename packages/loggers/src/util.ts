import * as path from 'path';
import util from 'util';
import _ from 'lodash';
import { AnyOpton } from './types';

const safeStringify = require('fast-safe-stringify');
const winston = require('winston');
require('winston-daily-rotate-file');


export const isProd = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prod';

export const packagejson = (): AnyOpton => require(path.join(process.cwd(), './package.json'));

/**
 * get error stack msg
 *
 * @param {any[]} [data=[]]
 * @return {*}
 */
export function getErrorStack(data: any[] = []): any {
  let result: any;
  for (let i = 0; i < data.length; i++) {
    const stack = _.get(data[i], 'stack') ||
      _.get(data[i], 'error.stack') ||
      _.get(data[i], 'err.stack') ||
      _.get(data[i], 'e.stack') || '';

    if (stack) {
      result = stack;
      break;
    }
  }
  return result;
}

const yunflyFormat = winston.format.printf(({ level, message, timestamp }: any) => {
  const output: any = { startTime: timestamp };
  let messages: any;

  const datas = _.get(message, ['0']) || {};
  if (typeof _.get(datas, 'trace.id') === 'string') {
    messages = datas.data || [];
    output['trace.id'] = datas['trace.id'];
    // 基于性能考虑，暂不打印transaction.id与sapn.id
    // output['transaction.id'] = datas['transaction.id'];
    // output['sapn.id'] = datas['sapn.id'];
    if (datas['stack']) {
      output['stack'] = datas['stack'];
    }
  }
  else {
    messages = message;
    if (level === 'error') {
      const stack = getErrorStack(messages);
      if (stack) output['stack'] = stack;
    }
  }

  output.data = messages.length > 1
    ? util.format(...messages)
    : (typeof messages[0] === 'object'
      ? safeStringify(messages[0], null, '  ')
      : messages[0]);

  return safeStringify(output);
});

export function getDefaultLogger(name: string) {
  const dirname = process.cwd();
  const businessFilename = !isProd ? path.join(dirname, 'log/business.log') : `/var/log/service/business/${name}/out.log`;
  const accessFilename = !isProd ? path.join(dirname, 'log/access.log') : `/var/log/service/access/${name}/out.log`;
  const errorFilename = !isProd ? path.join(dirname, 'log/error.log') : `/var/log/service/err/${name}/error.log`;

  const getLogger = ({ level, filename }: any) => winston.createLogger({
    level,
    format: winston.format.combine(
      winston.format.timestamp(),
      yunflyFormat,
    ),
    transports: [
      new winston.transports.DailyRotateFile({
        filename,
        datePattern: 'YYYY-MM-DD',
        maxSize: process.env.YUNFLY_LOGGER_FILE_OUT_MAX_SIZE || '1g',
        maxFiles: process.env.YUNFLY_LOGGER_FILE_OUT_MAX_BACKUPS || '10',
        auditFile: path.resolve(__dirname, './auditFile.json'),
      }),
    ],
  });

  return {
    infoLogger: getLogger({ level: 'info', filename: businessFilename }),
    accessLogger: getLogger({ level: 'info', filename: accessFilename }),
    errorLogger: getLogger({ level: 'error', filename: errorFilename }),
  };
}

