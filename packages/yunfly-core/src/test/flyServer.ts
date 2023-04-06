import FlyApp from '../script/index';
import { Config, KoaApp } from '../type';

let servers: any = null;

export function FlyServer(): Promise<any> {
  return new Promise((resolve) => {
    if (servers) {
      resolve(servers);
      return;
    }
    new FlyApp().start((config: Config, app: KoaApp, server: any) => {
      servers = server;
      resolve(server);
    });
  });
}
