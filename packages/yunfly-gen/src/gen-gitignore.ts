import chalk from "chalk";
import { Option } from './type'
const fs = require('fs-extra');


export default function genGitignore(option: Option) {
  const { outputDir } = option;
  const code = `
  *.iml
  .idea
  .vscode
  build
  log
  /openapi
  /api
  package-lock.json
  yarn-error.log
  node_modules
  src/plugin/**/node_modules
  coverage
`;

  fs.outputFileSync(`${outputDir}/.gitignore`, code);
  console.info(chalk.green('generate .gitignore file success.'))
}

