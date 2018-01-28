import { SET_REGISTRATION } from '../constants';

export default function(state = {}, action) {
  switch (action.type) {
    case SET_REGISTRATION:
      return action.registration;
    default:
      return state;
  }
}
