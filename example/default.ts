import * as tinject from '../lib';

const config: tinject.Config = {
  dstPort: 27017,
  host: 'tunneltest1.com',
  username: 'root',
  port: 8080
};

tinject([config, {
    dstPort: 27017,
    dstHost: 'localhost',
    host: 'tunneltest2.com',
    port: 9001,
    username: 'root',
    password: '123456'
}]);
