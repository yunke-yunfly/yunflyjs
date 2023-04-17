import * as path from 'path'
import genCode from './main'

const inquirer = require('inquirer');
const spawn = require('cross-spawn');

inquirer
  .prompt([
    {
      type: 'input',
      name: 'appName',
      message: "What's your app name",
      default() {
        return 'yunfly-example';
      },
    },
  ])
  .then(async (answers: { appName: string }) => {
    const outputDir = path.join(process.cwd(), `./${answers.appName}`);
    const opton = {
      name: answers.appName,
      outputDir,
    }
    genCode(opton);
    // 安装依赖
    spawn('cd ', [outputDir], { stdio: 'inherit' });
    const child = spawn('yarn ', ['install'], { stdio: 'inherit' });
    child.on('data', (data: string) => {
      console.log(data);
    });
  });