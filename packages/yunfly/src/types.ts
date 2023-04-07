import { Config as YunflyCoreConfig } from '@yunflyjs/yunfly-core';
import { BodyParserConfig } from '@yunflyjs/yunfly-plugin-body-parser';
import { ErrorConfig } from '@yunflyjs/yunfly-plugin-error';

export type Config =
  YunflyCoreConfig &
  { error?: ErrorConfig } &
  { log4js?: { enable: boolean } } &
  { bodyParser?: BodyParserConfig } 
