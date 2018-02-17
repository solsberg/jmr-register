import firebase, { database } from '../firebase';
import { setApplicationError, clearApplicationError } from './application';
import { SET_REGISTRATION, SET_REGISTRATION_STATUS, LOADING, LOADED, RECORD_EARLY_DEPOSIT } from '../constants';

const registrationsRef = database.ref('/event-registrations');

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
    registrationsRef.child(event.eventId).child(user.uid).once('value').then(snapshot => {
      dispatch(setRegistration(snapshot.val() || {}));
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
    registrationsRef.child(event.eventId).child(user.uid).child("order/externalPayment").update({
      type: externalType,
      timestamp: firebase.database.ServerValue.TIMESTAMP
    });
  }
}
