import { UPDATE_APPLICATION_STATE, SET_APPLICATION_ERROR } from '../constants';

export default function(state = {}, action) {
  switch (action.type) {
    case UPDATE_APPLICATION_STATE:
      return { ...state, state: action.value };
    case SET_APPLICATION_ERROR:
      return { ...state, error: action.message };
    default:
      return state;
  }
}
