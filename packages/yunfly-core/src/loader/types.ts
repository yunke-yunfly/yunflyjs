import { AnyOptionConfig, ApolloConfig, Config, Context, KoaApp } from '../type';

export interface PluginConfig {
  name: string;
  path?: string;
  package?: string;
  async?: boolean;
  lifeHook?: 'beforeStart' | 'appDidReady' | 'afterStart';
  priority?: number;
}

export interface YunflyAppOption {
  koaApp: KoaApp;
  config: Config;
  apolloConfig?: ApolloConfig;
  callback?: Function;
  lifeHook?: string;
}

export interface LoaderOption extends YunflyAppOption {
  yunflyApp: Yunfly.YunflyAppConfig;
}

export interface PluginOptions extends LoaderOption {
  pluginConfig: AnyOptionConfig | any;
}

export interface PluginDirRes {
  pluginDir: string;
  pluginSrc: string;
  pluginPkg: string;
}

export type YunflyPluginObj = (option: YunflyAppOption) => void;

export interface YunflyAppInterface {
  koaApp: KoaApp;
  config: Config;
  apolloConfig: ApolloConfig;
  ctx: Context;
  addPlugin(pluginName: string, pluginObj: YunflyPluginObj): void;
  [props: string]: any;
}
