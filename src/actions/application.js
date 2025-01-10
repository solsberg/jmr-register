import { APPLICATION_ERROR_CHANGED } from '../constants';
import { log } from '../lib/utils';

export const setApplicationError = (err, uiMessage) => {
  log(err);
  return {
    type: APPLICATION_ERROR_CHANGED,
    message: uiMessage
  }
};

export const clearApplicationError = () => {
  return {
    type: APPLICATION_ERROR_CHANGED,
    message: ''
  }
};
