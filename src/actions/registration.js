import { fetchRegistration, recordExternalPayment as recordExternalPaymentApi } from '../lib/api';
import { setApplicationError, clearApplicationError } from './application';
import { SET_REGISTRATION, SET_REGISTRATION_STATUS, LOADING, LOADED, RECORD_EARLY_DEPOSIT } from '../constants';

export const setRegistration = (registration) => {
  return {
    type: SET_REGISTRATION,
    registration
  }
}

export const setRegistrationStatus = (status) => {
  return {
    type: SET_REGISTRATION_STATUS,
    status
  }
}

export const loadRegistration = (event, user) => {
  return (dispatch) => {
    if (!event || !user) {
      return;
    }
    dispatch(setRegistrationStatus(LOADING));
    return fetchRegistration(event, user).then(registration => {
      dispatch(setRegistration(registration || {}));
      dispatch(setRegistrationStatus(LOADED));
      dispatch(clearApplicationError());
    })
    .catch(err => dispatch(setApplicationError(err, "Unable to load registration")));
  };
};

export const recordEarlyDeposit = () => ({
  type: RECORD_EARLY_DEPOSIT
});

export const recordExternalPayment = (event, user, externalType) => {
  return (dispatch) => {
    recordExternalPaymentApi(event, user, externalType, 'earlyDeposit');
    window.Rollbar.info("Early deposit external payment", {event, user, externalType});
  }
}
