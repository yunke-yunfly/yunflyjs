import chalk from "chalk";
import { Option } from './type'
const fs = require('fs-extra');


export default function genPackageJson(option: Option) {
  const packageJson = require('../package.json');
  const { name, outputDir } = option;
  const code = `{
  "name": "${name}",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT",
  "scripts": {
    "dev": "cross-env NODE_ENV=dev PORT=3000 yunfly",
    "watch:dev": "cross-env NODE_ENV=dev PORT=3000 yunfly --watch",
    "run": "cross-env PORT=3000 NODE_ENV=production RUNTIME_ENV=prod yunfly",
    "build": "yarn clean && yarn compile",
    "clean": "gts clean",
    "compile": "tsc -p ."
  },
  "dependencies": {
    "@yunflyjs/yunfly": "^${packageJson.version}"
  },
  "devDependencies": {
    "cross-env": "^7.0.3",
    "gts": "^3.1.1",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.0.4"
  }
}
`;

  fs.outputFileSync(`${outputDir}/package.json`, code);
  console.info(chalk.green('generate package.json file success.'))
}

