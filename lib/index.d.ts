import * as events from 'events';

type Config = Partial<{
  dstHost: string;
  dstPort: number;
  username: string;
  password: string;
  host: string;
  port: string;
}>;

export as namespace injTunnelSSH;

export = tinject;

declare function tinject(config: Array<Config>): events.EventEmitter;
