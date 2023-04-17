import genConfig from './gen-config.default';
import genController from './gen-controller';
import genGitignore from './gen-gitignore';
import genPackageJson from './gen-package.json';
import genTsconfig from './gen-tsconfig.json';
import genMiddleware from './gen-middleware';
import { Option } from './type'

export default function genCode(option: Option) {
  genPackageJson(option);
  genTsconfig(option);
  genGitignore(option);
  genConfig(option);
  genController(option);
  genMiddleware(option);
}

