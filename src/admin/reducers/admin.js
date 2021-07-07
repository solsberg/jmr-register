import { SET_ADMIN_DATA, UPDATE_ADMIN_REGISTRATION } from '../../constants';

export default function(state = {data: []}, action) {
  switch (action.type) {
    case SET_ADMIN_DATA:
      return { ...state, data: action.data };
    case UPDATE_ADMIN_REGISTRATION:
      let pos = state.data.findIndex(r => r.user.uid === action.uid);
      const newRegistration = {
        user: state.data[pos].user,
        registration: action.registration
      };
      return { ...state, data: [...state.data.slice(0, pos), newRegistration, ...state.data.slice(pos+1)]};
    default:
      return state;
  }
}
