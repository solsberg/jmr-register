import { UPDATE_APPLICATION_STATE, SET_APPLICATION_ERROR, LOADED, SET_CURRENT_EVENT } from '../constants';

export const setApplicationLoaded = () => {
  return {
    type: UPDATE_APPLICATION_STATE,
    value: LOADED
  };
};

export const setApplicationError = (err, uiMessage) => {
  console.log(err);
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
