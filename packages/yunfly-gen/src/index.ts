const path = require('path');
const inquirer = require('inquirer');
const genCode = require('./dist/index.js').default;

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
  .then((answers: { appName: string }) => {
    const opton = {
      name: answers.appName,
      outputDir: path.join(process.cwd(), `./${answers.appName}`)
    }
    genCode(opton);
  });