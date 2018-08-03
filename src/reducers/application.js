import { APPLICATION_STATE_CHANGED, APPLICATION_ERROR_CHANGED, LOADING,
  CURRENT_EVENT_SELECTED, SERVER_TIMESTAMP_RECEIVED } from '../constants';

export default function(state = {state: LOADING, error: ''}, action) {
  switch (action.type) {
    case APPLICATION_STATE_CHANGED:
      return { ...state, state: action.value };
    case APPLICATION_ERROR_CHANGED:
      return { ...state, error: action.message };
    case CURRENT_EVENT_SELECTED:
      return { ...state, currentEvent: action.event };
    case SERVER_TIMESTAMP_RECEIVED:
      return { ...state, serverTimestamp: action.timestamp };
    default:
      return state;
  }
}
