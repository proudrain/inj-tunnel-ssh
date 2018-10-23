import * as tinject from '../lib';

const config: tinject.Config = {
  dstPort: 27017,
  host: 'tunneltest1.com',
  username: 'root'
};

tinject([config, {
    dstPort: 27017,
    host: 'tunneltest2.com',
    username: 'root'
}]);
