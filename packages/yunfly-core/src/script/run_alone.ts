import logger from '@yunflyjs/loggers';
import getConfig from '../config';
import { DEFAULT_ALONE_DIR } from '../const';
import { getDirPaths } from '../util';

const config = getConfig({ type: 2 });

// read alone files
// traverse all the alone files.
try {
  const run = async () => {
    let paths = await getDirPaths(DEFAULT_ALONE_DIR);

    // filter .d.ts files
    paths = paths.filter((path: string) => (path.indexOf('.d.ts') > -1 ? false : true));

    if (!paths || !paths.length) {
      return;
    }

    paths.forEach((path: string) => {
      const aloneFn = require(path).default;
      if (typeof aloneFn === 'function') {
        try {
          aloneFn(config);
        } catch (err) {
          logger.color('#ff0000').window().error({
            msg: '### warning: Alone process have some wrong',
            error: err,
          });
          throw err;
        }
      }
    });
  };
  run();
} catch (err) {
  logger.window().error({
    msg: '###warning: failed to execute alone process file.',
    error: err,
  });
  process.exit(1);
}


