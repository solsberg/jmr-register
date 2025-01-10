import { APPLICATION_STATE_CHANGED, APPLICATION_ERROR_CHANGED, LOADING } from '../constants';

export default function(state = {state: LOADING, error: ''}, action) {
  switch (action.type) {
    case APPLICATION_STATE_CHANGED:
      return { ...state, state: action.value };
    case APPLICATION_ERROR_CHANGED:
      return { ...state, error: action.message };
    default:
      return state;
  }
}
