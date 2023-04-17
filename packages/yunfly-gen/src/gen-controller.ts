import chalk from "chalk";
import { Option } from './type'
const fs = require('fs-extra');


export default function genController(option: Option) {
  const { outputDir } = option;
  const code = `import { Get, JsonController, BodyParam, Post, QueryParam } from '@yunflyjs/yunfly';
/**
 * 测试案例controller
 *
 * @export
 * @class TestController
 */
@JsonController('/example')
export default class ExampleController {
  /**
   * 简单案例 - get
   *
   * @param {string} name 姓名
   * @return {*}  {string}
   * @memberof ExampleController
   */
  @Get('/simple/get')
  simple(
    @QueryParam('name') name: string,
  ): string {
    return name || 'success';
  }
  /**
  * 简单案例 -post
  *
  * @param {string} name 姓名
  * @return {*}  {string}
  * @memberof ExampleController
  */
  @Post('/simple/post')
  simple1(
    @BodyParam('name') name: string,
  ): string {
    return name || 'success';
  }
}
`;

  fs.outputFileSync(`${outputDir}/src/controller/ExampleController.ts`, code);
  console.info(chalk.green('generate src/controller/ExampleController.ts file success.'))
}

