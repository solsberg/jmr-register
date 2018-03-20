import pick from 'lodash/pick';
import { SIGN_IN, SIGN_OUT } from '../constants';

export default function(state = {currentUser: null}, action) {
  switch (action.type) {
    case SIGN_IN:
      return {
        ...state,
        currentUser: pick(action, ['email', 'uid', 'admin'])
          };
    case SIGN_OUT:
      return { ...state, currentUser: null };
    default:
      return state;
  }
}
