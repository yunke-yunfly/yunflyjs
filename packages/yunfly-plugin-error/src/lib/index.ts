import Koa from 'koa';
import { errorResponse } from '../middleware/YunflyPluginErrorMIddleware';
import { ErrorConfig } from '../types';

/**
 * global error handle
 *
 * @export
 * @param {FlyApp} app
 * @param {ErrorConfig} pluginConfig
 */
export default function Error(
  app: Koa<Koa.DefaultState, Koa.DefaultContext>,
  pluginConfig: ErrorConfig,
) {
  const unhandledRejection = pluginConfig.unhandledRejection || (() => {});
  const uncaughtException = pluginConfig.uncaughtException || (() => {});
  const customError = pluginConfig.customError;

  const errhandle = customError
    ? pluginConfig.useYunflyLog
      ? (err: any, ctx: Koa.Context) => {
          errorResponse(err, ctx);
          customError.bind(null, err, ctx);
        }
      : customError
    : (err: any, ctx: Koa.Context) => errorResponse(err, ctx);

  process.on('unhandledRejection', (err: any) => {
    unhandledRejection(err);
  });

  process.on('uncaughtException', (err: any) => {
    uncaughtException(err);
  });

  app.on('error', (err: any, ctx: Koa.Context) => {
    errhandle(err, ctx);
  });
}
