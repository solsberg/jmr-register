import { UPDATE_APPLICATION_STATE, SET_APPLICATION_ERROR, LOADED,
  SET_CURRENT_EVENT, SET_SERVER_TIMESTAMP } from '../constants';
import { log } from '../lib/utils';

export const setApplicationLoaded = () => {
  return {
    type: UPDATE_APPLICATION_STATE,
    value: LOADED
  };
};

export const setApplicationError = (err, uiMessage) => {
  log(err);
  return {
    type: SET_APPLICATION_ERROR,
    message: uiMessage
  }
};

export const clearApplicationError = () => {
  return {
    type: SET_APPLICATION_ERROR,
    message: ''
  }
};

export const setCurrentEvent = (event) => {
  return {
    type: SET_CURRENT_EVENT,
    event
  }
}

export const setServerTimestamp = (timestamp) => {
  return {
    type: SET_SERVER_TIMESTAMP,
    timestamp
  };
}
