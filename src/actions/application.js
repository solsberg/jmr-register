import { APPLICATION_STATE_CHANGED, APPLICATION_ERROR_CHANGED, LOADED,
  CURRENT_EVENT_SELECTED, SERVER_TIMESTAMP_RECEIVED } from '../constants';
import { log } from '../lib/utils';

export const setApplicationLoaded = () => {
  return {
    type: APPLICATION_STATE_CHANGED,
    value: LOADED
  };
};

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

export const selectCurrentEvent = (event) => {
  return {
    type: CURRENT_EVENT_SELECTED,
    event
  }
}

export const setServerTimestamp = (timestamp) => {
  return {
    type: SERVER_TIMESTAMP_RECEIVED,
    timestamp
  };
}
