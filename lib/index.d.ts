import * as events from 'events';

type _Config = Partial<{
  dstHost: string;
  dstPort: number;
  username: string;
  password: string;
  host: string;
  port: string;
}>;

export as namespace tInjectSSH;

export = tinject;

declare function tinject(config: Array<_Config>): events.EventEmitter;
declare namespace tinject {
  export type Config = _Config;
}
