
export interface TypeGetAddress {
  address: string | null
  port: number;
  protocol: 'http' | 'https';
}

export interface TypeMaster {
  exec: string;
  alone?: string;
  port: number;
  count?: number;
  slaves?: string;
  args?: any;
  limit?: number;
  duration?: number;
  env?: AnyOptions;
  windowsHide?: boolean;
  https?: boolean;
  address?: string;
  title?: string;
  yunflyVerfion?: string;
  mode?: string;
  refork?: boolean;
  isWatch?: boolean;
}

export interface AnyOptions {
  [props: string]: any;
}

export interface TypeWorker {
  options: AnyOptions;
  master: any;
}