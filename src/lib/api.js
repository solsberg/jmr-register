import firebase, { database, auth } from '../firebase';
import axios from 'axios';
import config from '../config';
import toPairs from 'lodash/toPairs';

const eventsRef = database.ref('/events');
const registrationsRef = database.ref('/event-registrations');

export const fetchEvents = () => {
  return new Promise((resolve, reject) => {
    eventsRef.once('value').then(snapshot => {
      const events = toPairs(snapshot.val())
        .map(([eventId, event]) => ({ ...event, eventId }));
      resolve(events);
    })
    .catch(err => {
      reject(err);
    });
  });
};

export const fetchRegistration = (event, user) => {
  return new Promise((resolve, reject) => {
    registrationsRef.child(event.eventId).child(user.uid).once('value').then(snapshot => {
      resolve(snapshot.val());
    })
    .catch(err => {
      reject(err);
    });
  });
};

export const recordExternalPayment = (event, user, type) => registrationsRef
  .child(event.eventId)
  .child(user.uid)
  .child("order/externalPayment")
  .update({
    type,
    timestamp: firebase.database.ServerValue.TIMESTAMP
  });

export const sendAdminEmail = (subject, text) => {
  window.Rollbar.info('Sending admin email', {subject, text});
  return axios.post(config.API_BASE_URL + 'adminEmail', {
    subject,
    text
  });
};

export const fetchImportedProfile = (email) => {
  return auth.currentUser.getIdToken().then(idToken =>
    axios.get(encodeURI(`${config.API_BASE_URL}importedProfile?idToken=${idToken}&email=${email}`))
  ).then((response) => response.data);
};
