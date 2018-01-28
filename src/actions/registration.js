import { database } from '../firebase';
import { setApplicationError, clearApplicationError } from './application';
import { SET_REGISTRATION } from '../constants';

const registrationsRef = database.ref('/event-registrations');

export const setRegistration = (registration) => {
  return {
    type: SET_REGISTRATION,
    registration
  }
}

export const loadRegistration = (event, user) => {
  return (dispatch) => {
    if (!event || !user) {
      return;
    }
    registrationsRef.child(event.eventId).child(user.uid).once('value').then(snapshot => {
      dispatch(setRegistration(snapshot.val() || {}));
      dispatch(clearApplicationError());
    })
    .catch(err => dispatch(setApplicationError(err, "Unable to load registration")));
  };
};
