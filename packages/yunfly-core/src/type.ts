import * as Koa from 'koa';
import { RoutingControllersOptions } from '@yunflyjs/routing-controllers';

export type FlyApp = Koa<Koa.DefaultState, Koa.DefaultContext> & {
  config: Config;
  context: Context;
};

export type KoaApp = Koa<Koa.DefaultState, Koa.DefaultContext> & {
  config: Config;
  context: Context;
};

export interface ApolloConfig {
  [key: string]: any;
}

export interface AnyOptionConfig {
  [propsname: string]: any;
}

export interface ClusterConfig {
  enable?: boolean;
  reloadDelay?: number;
  useAloneWorker?: boolean;
  env?: AnyOptionConfig;
  count?: number;
  mode?: string;
  refork?: boolean;
  args?: string[];
  [prop: string]: any;
}

// config details
export interface Config {
  // get yunfly version
  version?: string;
  // get envs
  env?: string;
  port?: number;
  // routing-controller config
  routingControllersOptions?:
  | RoutingControllersOptions
  | RoutingControllersOptions[]
  | ((opt?: any) => RoutingControllersOptions | RoutingControllersOptions[]);
  // cluster config
  cluster?: ClusterConfig;
  // inject typedi
  typedi?: (Container: any) => any;
  // bodyParser
  bodyParser?: AnyOptionConfig;
  // any key
  [propsname: string]: any;
}

export interface YunFlyOptions {
  jest?: boolean;
  [prop: string]: any;
}

export interface Context extends Koa.Context {
  config: Config;
  traceId: string;
  redis: any;
}

export enum AppLifeHook {
  'beforeStart' = 'beforeStart',
  'configDidReady' = 'configDidReady',
  'appDidReady' = 'appDidReady',
  'afterStart' = 'afterStart',
}

export interface PluginConfig {
  name: string;
  path?: string;
  package?: string;
  async?: boolean;
  lifeHook?: 'beforeStart' | 'appDidReady' | 'afterStart';
  priority?: number;
}

export interface LoaderOption {
  koaApp: KoaApp;
  config: Config;
  apolloConfig?: ApolloConfig;
  callback?: Function;
  lifeHook?: string;
  server?: any,
}

export interface PluginDirRes {
  pluginDir: string;
  pluginSrc: string;
  pluginPkg: string;
}