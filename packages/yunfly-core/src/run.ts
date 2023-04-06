/**
 * use script run app
 * time 2020.11.25
 * author wangw19@mingyuanyun.com
 */
import { YunflyAppInterface } from './loader/types';

export * from './type';
export * from './test/flyServer';
export * from './util';
export * from '@yunflyjs/routing-controllers';
export * from 'typedi';
export * from '@yunflyjs/errors';
export {
  BadRequestError, ForbiddenError, InternalServerError,
  MethodNotAllowedError, NotFoundError, UnauthorizedError,
} from '@yunflyjs/errors';
export { PluginConfig } from './loader/types';
export { getCurrentContext } from './core/current-context';
export { default as YController } from './loader/controller';
export { default as YService } from './loader/service';
export { YunflyAppInterface };
export { default as default } from './script/index';

/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Yunfly {
    interface YunflyAppConfig extends YunflyAppInterface { }
  }
}
