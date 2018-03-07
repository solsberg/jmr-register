import { SET_ADMIN_DATA } from '../../constants';

export default function(state = {data: []}, action) {
  switch (action.type) {
    case SET_ADMIN_DATA:
      return { ...state, data: action.data };
    default:
      return state;
  }
}
