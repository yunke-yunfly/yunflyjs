import { KoaApp } from '@yunflyjs/yunfly-core';

export interface BodyParserConfig {
  enable: boolean;
  jsonLimit?: string;
  formLimit?: string;
  queryString?: {
    parameterLimit?: number;
    [props: string]: any;
  };
  enableTypes?: string | string[];
  encoding?: string;
  textLimit?: string;
  xmlLimit?: string;
  strict?: boolean;
  [props: string]: any;
}


export interface BodyParserOption {
  koaApp: KoaApp;
  pluginConfig: BodyParserConfig;
}

