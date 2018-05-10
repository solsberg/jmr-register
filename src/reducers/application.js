import { UPDATE_APPLICATION_STATE, SET_APPLICATION_ERROR, LOADING,
  SET_CURRENT_EVENT, SET_SERVER_TIMESTAMP } from '../constants';

export default function(state = {state: LOADING, error: ''}, action) {
  switch (action.type) {
    case UPDATE_APPLICATION_STATE:
      return { ...state, state: action.value };
    case SET_APPLICATION_ERROR:
      return { ...state, error: action.message };
    case SET_CURRENT_EVENT:
      return { ...state, currentEvent: action.event };
    case SET_SERVER_TIMESTAMP:
      return { ...state, serverTimestamp: action.timestamp };
    default:
      return state;
  }
}
