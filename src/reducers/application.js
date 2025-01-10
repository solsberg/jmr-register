import { APPLICATION_STATE_CHANGED, APPLICATION_ERROR_CHANGED, LOADING,
  SERVER_TIMESTAMP_RECEIVED, SET_ROOM_UPGRADE } from '../constants';

export default function(state = {state: LOADING, error: ''}, action) {
  switch (action.type) {
    case APPLICATION_STATE_CHANGED:
      return { ...state, state: action.value };
    case APPLICATION_ERROR_CHANGED:
      return { ...state, error: action.message };
    case SERVER_TIMESTAMP_RECEIVED:
      return { ...state, serverTimestamp: action.timestamp };
    case SET_ROOM_UPGRADE:
      let roomUpgrade = action.roomUpgrade || {};
      roomUpgrade.eventId = action.eventid;
      return { ...state, roomUpgrade };
    default:
      return state;
  }
}
