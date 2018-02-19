import { SET_REGISTRATION, RECORD_EARLY_DEPOSIT } from '../constants';

export default function(state = {}, action) {
  switch (action.type) {
    case SET_REGISTRATION:
      const earlyDeposit = action.registration && action.registration.earlyDeposit;
      return { ...state, complete: earlyDeposit && earlyDeposit.status === 'paid' };
    case RECORD_EARLY_DEPOSIT:
      return { ...state, complete: true };
    default:
      return state;
  }
}
