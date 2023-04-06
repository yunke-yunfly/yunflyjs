import { AsyncLocalStorage } from 'async_hooks';

import * as koa from 'koa';
// async hooks
export const asyncLocalStorage = new AsyncLocalStorage();

/**
 * currentTrace
 * @export
 * @return {*}
 */
export default function currentContext(): Function {
  return async function (ctx: koa.Context, next: Function) {
    asyncLocalStorage.enterWith(ctx);
    return await next();
  };
}

/**
 * get current context object.
 *
 * @export
 * @return {*}  {(Koa.Context | undefined)}
 */
export function getCurrentContext(): koa.Context | undefined {
  try {
    return asyncLocalStorage.getStore() as koa.Context;
  } catch (err: any) {
    return undefined;
  }
}
