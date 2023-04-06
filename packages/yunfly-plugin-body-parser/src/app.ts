import { BodyParserConfig, BodyParserOption } from './types';

const bodyParser = require('koa-bodyparser');

/**
 * yunfly probe plugin
 *
 * @export
 * @param {*} { app, pluginConfig }
 * @returns {void}
 */
export default function YunflyBodyParsePlugin({ koaApp, pluginConfig }: BodyParserOption): void {
  // use body parse
  koaApp.use(bodyParser(pluginConfig || {}));
}

export {
  BodyParserConfig,
};
