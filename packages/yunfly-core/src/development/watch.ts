const path = require('path');
const EventEmitter = require('events');
const chokidar = require('chokidar');
const chalk = require('chalk');

/**
 * dev watch file and reload app
 *
 * @class Watch
 * @extends {EventEmitter}
 */
export default class Watch extends EventEmitter {
  constructor() {
    super();
    // watch dir
    this.WATCH_DIR = path.join(process.cwd(), '/src').replace(/\\/g, '//');
  }

  /**
   * init watch files
   *
   * @memberof Watch
   */
  init() {
    const config = {
      ignoreInitial: true,
    };
    // watching
    chokidar
      .watch(this.WATCH_DIR, config)
      .on('add', (path: string) => this.reloadApp(`File ${path} has been added`, path))
      .on('change', (path: string) => this.reloadApp(`File ${path} has been changed`, path))
      .on('unlink', (path: string) => this.reloadApp(`File ${path} has been removed`, path))
      .on('addDir', (path: string) => this.reloadApp(`Directory ${path} has been added`, path))
      .on('unlinkDir', (path: string) =>
        this.reloadApp(`Directory ${path} has been removed`, path),
      );
  }

  /**
   * watch files change and reload koa server
   *
   * @param {string} print
   * @param {string} path
   * @memberof Watch
   */
  reloadApp(print: string, path: string) {
    console.info(chalk.blue(print));

    const isAloneFileChange = /(srcalone)|(src\/alone)|(src\\alone)/.test(path);
    if (isAloneFileChange) {
      this.emit('reload-app-alone', {
        action: 'reload-app-alone',
        from: 'app',
        to: 'app',
      });
    } else {
      this.emit('reload-app-worker', {
        action: 'reload-app-worker',
        from: 'app',
        to: 'app',
      });
    }
  }
}
