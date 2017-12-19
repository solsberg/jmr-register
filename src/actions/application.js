import { UPDATE_APPLICATION_STATE, SET_APPLICATION_ERROR, LOADED } from '../constants';

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
