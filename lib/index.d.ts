import * as events from 'events';

export as namespace tInjectSSH;

export = tinject;

declare function tinject(config: Array<tinject.Config>): events.EventEmitter;
declare namespace tinject {
  export type Config = Partial<{
    dstHost: string;
    dstPort: number;
    username: string;
    password: string;
    host: string;
    port: number;
  }>;
}
