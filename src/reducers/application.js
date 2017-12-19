import { UPDATE_APPLICATION_STATE, SET_APPLICATION_ERROR, ERROR } from '../constants';

export default function(state = {}, action) {
  switch (action.type) {
    case UPDATE_APPLICATION_STATE:
      return {
        state: action.value
      };
    case SET_APPLICATION_ERROR:
      return {...state, state: ERROR, error: action.message};
    default:
      return state;
  }
}
