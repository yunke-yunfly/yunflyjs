import chalk from "chalk";
import { Option } from './type'
const fs = require('fs-extra');


export default function genMiddleware(option: Option) {
  const { outputDir } = option;
  const code = `import { KoaMiddlewareInterface, Context, Middleware } from "@yunflyjs/yunfly";

@Middleware({ type: 'before' })
export class ExampleMiddleware implements KoaMiddlewareInterface {
  async use(context: Context, next: (err?: any) => Promise<any>): Promise<any> {
    console.log("do something before execution...");
    await next();
    console.log("do something after execution...");
  }
}
`;

  fs.outputFileSync(`${outputDir}/src/middleware/ExampleMiddleware.ts`, code);
  console.info(chalk.green('generate src/middleware/ExampleMiddleware.ts file success.'))
}

