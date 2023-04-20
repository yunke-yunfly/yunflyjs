import { Config as YunflyCoreConfig } from '@yunflyjs/yunfly-core';

export type Config =
  YunflyCoreConfig &
  { log4js?: { enable: boolean } }

