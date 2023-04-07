import { getRuningFile } from "./util";

export default class Runing {
  options: any;

  constructor() {
    this.options = {};
  }

  init(options: any) {
    this.options = options;
    require(getRuningFile());
  }
}
