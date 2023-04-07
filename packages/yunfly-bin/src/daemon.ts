import * as process from "process";
import logger from '@yunflyjs/loggers';
const spawn = require("cross-spawn");

const args = process.argv.slice(2);
const { stdout } = spawn(args[0], args.slice(1));

stdout.on("readable", () => {
  let chunk;
  while (null !== (chunk = stdout.read())) {
    const str = chunk.toString();
    logger.window().log(str);
    if (str.includes("afterStart")) {
      logger.window().log("守护进程,启动成功! \n");
      process.exit(0);
    }
  }
});
