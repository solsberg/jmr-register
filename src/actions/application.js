import { UPDATE_APPLICATION_STATE, LOADED } from '../constants';

export const setApplicationLoaded = () => {
  return {
    type: UPDATE_APPLICATION_STATE,
    value: LOADED
  };
};
