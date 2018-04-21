import { SET_REGISTRATION, SET_REGISTRATION_STATUS, UPDATE_CART } from '../constants';

export default function(state = {}, action) {
  switch (action.type) {
    case SET_REGISTRATION:
      return { ...state, data: action.registration, profile: action.profile };
    case SET_REGISTRATION_STATUS:
      return { ...state, status: action.status };
    case UPDATE_CART:
      debugger;
      let cart = { ...state.data.cart, ...action.values };
      let registration = { ...state.data, cart };
      return { ...state, data: registration };
    default:
      return state;
  }
}
