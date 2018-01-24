import cacher from './cacher';
import {passthru, shouldIgnore} from './app-utils';
import * as _ from 'underscore';
import fs from 'fs';

const getGLobals = () => JSON.parse(fs.readFileSync('./global-props.json', 'utf-8'));

const middleware = () => (req, res, next) => {
  if (shouldIgnore(req)) {
    return next();
  }
  cacher.get(req).then((payload) => {
    if (!payload) {
      // Not in cache, keep on moving.
      return next();
    }

    try {
      payload.body = _.template(payload.body)(getGLobals()).trim();
    } catch(error) {}

    passthru(res, payload);
  }).catch(err => {
    console.log('Cache error', err);
    next();
  });
};

export default middleware;
