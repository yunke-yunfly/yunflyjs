/*
 * 通过子进程的方式运行ts代码，获取config配置，写入文件暂存
 */
import getConfig from '@yunflyjs/yunfly-core/build/config';

(process as any).send({
  action: 'get-config',
  data: getConfig({ type: 0 }),
});

process.exit(1);
