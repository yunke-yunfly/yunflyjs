import { Config } from '@yunflyjs/yunfly-core'

export interface MetadataConfig {
  [props: string]: any;
}

export interface MetadataOptions {
  enable?: boolean;
}

export interface MetadataOption {
  koaApp: any;
  pluginConfig: MetadataOptions;
  yunflyApp: any;
  config: Config;
}