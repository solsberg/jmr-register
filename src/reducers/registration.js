import set from "lodash/set";
import { SET_REGISTRATION, SET_REGISTRATION_STATUS, UPDATE_CART, UPDATE_ORDER,
  UPDATE_PROFILE, SET_PERSONAL_INFO, ADD_PAYMENT, UPDATE_SCHOLARSHIP, SET_PROMOTIONS } from '../constants';

export default function(state = {}, action) {
  let registration;
  switch (action.type) {
    case SET_REGISTRATION:
      return { ...state, data: action.registration, profile: action.profile };
    case SET_REGISTRATION_STATUS:
      return { ...state, status: action.status };
    case UPDATE_CART:
      let cart = (state.data && state.data.cart) || {};
      cart = { ...cart, ...action.values };
      registration = { ...state.data, cart };
      return { ...state, data: registration };
    case UPDATE_ORDER:
      let order = (state.data && state.data.order) || {};
      order = { ...order, ...action.values };
      registration = { ...state.data, order };
      return { ...state, data: registration };
    case UPDATE_SCHOLARSHIP:
      registration = { ...state.data, scholarship: action.values };
      return { ...state, data: registration };
    case SET_PERSONAL_INFO:
      registration = { ...state.data, personal: action.personalInfo };
      return { ...state, data: registration };
    case UPDATE_PROFILE:
      return { ...state, profile: action.profile };
    case ADD_PAYMENT:
      let payments = (state.data && state.data.account && state.data.account.payments) || {};
      payments = Object.assign({}, payments, {newPayment: action.payment});
      return { ...state, data: set(state.data, "account.payments", payments) };
    case SET_PROMOTIONS:
      registration = {
        ...state.data,
        bambam: action.promotions.bambam,
        roomUpgrade: action.promotions.roomUpgrade
      };
      return { ...state, data: registration };
    default:
      return state;
  }
}
