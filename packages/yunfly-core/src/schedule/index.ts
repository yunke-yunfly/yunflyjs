import logger from '@yunflyjs/loggers';
import { DEFAULT_SCHEDULE_DIR } from '../const';
import { AnyOptionConfig, Config, KoaApp } from '../type';
import { getDirPaths } from '../util';

const cluster = require('cluster');
const nodeSchedule = require('node-schedule');

/**
 * 定时任务处理器
 *
 * @export
 * @class Schedule
 */
export default class Schedule {
  config: Config;
  app: KoaApp;
  dir: undefined | string;

  constructor({ config, app, dir }: { config: Config; app?: KoaApp; dir?: string }) {
    this.config = config;
    this.app = app as KoaApp;
    this.dir = dir;
  }

  /**
   * ready
   *
   * @memberof Schedule
   */
  ready() {
    // run schedule
    this.runSchedule();
  }

  /**
   * run schedule
   *
   * @return {*}
   * @memberof Schedule
   */
  async runSchedule() {
    let paths = await getDirPaths(this.dir || DEFAULT_SCHEDULE_DIR);

    // filter .d.ts files
    paths = paths.filter((path: string) => (path.indexOf('.d.ts') > -1 ? false : true));

    if (!paths || !paths.length) {
      return;
    }

    const scheduleItemRun = (path: string) => {
      const schedule = require(path).default;

      if (!schedule) {
        return;
      }

      const scheduleTask = schedule();

      if (!scheduleTask.schedule || !scheduleTask.schedule.enable || !scheduleTask.schedule.cron) {
        return;
      }

      const type = scheduleTask.schedule.type || 'worker';
      if (type === 'worker' && cluster.isWorker) {
        cluster.worker.on('message', (msg: AnyOptionConfig) => {
          const { from, to, action } = msg || {};
          if (from === 'app' && to === 'worker' && action === 'random-select-worker') {
            this.runScheduleTask(scheduleTask);
          }
        });
      } else {
        this.runScheduleTask(scheduleTask);
      }
    };

    paths.forEach((path: string) => {
      scheduleItemRun(path);
    });
  }

  /**
   * ren schedule task
   *
   * @param {AnyOptionConfig} scheduleTask
   * @memberof Schedule
   */
  runScheduleTask(scheduleTask: AnyOptionConfig) {
    if (scheduleTask.task && typeof scheduleTask.task === 'function') {
      // 定时任务执行器
      nodeSchedule.scheduleJob(scheduleTask.schedule.cron, () => {
        try {
          scheduleTask.task(this.config, this.app);
        } catch (err) {
          logger.color('#ff0000').window().error({
            msg: 'error: run schedule task error. error msg:',
            error: err,
          });
          throw err;
        }
      });
    }
  }
}
