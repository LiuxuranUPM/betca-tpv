import {name, version} from '../../package.json';

export const environment = {
  production: true,
  NAME: name,
  VERSION: version,
  REST_USER: 'https://betca-tpv-user.herokuapp.com/api/v0',
  REST_CORE: 'https://betca-tpv-core.herokuapp.com'
};
