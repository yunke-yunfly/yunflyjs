// first step. Use yunke logger in header
import logger from '@yunflyjs/loggers';
import InitApp from './app';

// runing koa servers at every worker.
try {
  const { port, count }: any = JSON.parse(process.argv[2]);
  new InitApp({ port, count }).ready();
} catch (err) {
  logger.window().error({
    msg: '###warning: get service port error. please check!',
    error: err,
  });
}

