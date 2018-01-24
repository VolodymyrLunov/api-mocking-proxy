import cacher from './cacher';
import {passthru, shouldIgnore} from './app-utils';
import * as _ from 'underscore';

const middleware = () => (req, res, next) => {
  if (shouldIgnore(req)) {
    return next();
  }
  cacher.get(req).then((payload) => {
    if (!payload) {
      // Not in cache, keep on moving.
      return next();
    }

    if (!_.isEmpty(payload.replacements)) {
      try { payload.body = _.template(payload.body)(payload.replacements); }
      catch(error) {}
    }

    passthru(res, payload);
  }).catch(err => {
    console.log('Cache error', err);
    next();
  });
};

export default middleware;
