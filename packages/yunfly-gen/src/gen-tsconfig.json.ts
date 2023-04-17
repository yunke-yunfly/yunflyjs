import chalk from "chalk";
import { Option } from './type'
const fs = require('fs-extra');


export default function genTsconfig(option: Option) {
  const { outputDir } = option;
  const code = `{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./build/",
    "module": "commonjs",
    "target": "es2017",
    "strict": true,
    "allowJs": false,
    "noUnusedLocals": true,
    "removeComments": true,
    "declaration": true,
    "skipLibCheck": true,
    "importHelpers": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "forceConsistentCasingInFileNames": true,
    "emitDecoratorMetadata": true,
    "noEmitOnError": true,
    "noUnusedParameters": false,
    "strictPropertyInitialization": false,
    "sourceMap": false,
    "declarationDir": "./build/"
  },
  "include": [
    "src/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "src/__tests__"
  ]
}
`;

  fs.outputFileSync(`${outputDir}/tsconfig.json`, code);
  console.info(chalk.green('generate tsconfig.json file success.'))
}

