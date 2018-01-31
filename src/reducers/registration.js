import { SET_REGISTRATION, SET_REGISTRATION_STATUS } from '../constants';

export default function(state = {}, action) {
  switch (action.type) {
    case SET_REGISTRATION:
      return { ...state, data: action.registration };
    case SET_REGISTRATION_STATUS:
      return { ...state, status: action.status };
    default:
      return state;
  }
}
