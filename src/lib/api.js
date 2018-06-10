import firebase, { database, auth } from '../firebase';
import axios from 'axios';
import config from '../config';
import toPairs from 'lodash/toPairs';

const eventsRef = database.ref('/events');
const registrationsRef = database.ref('/event-registrations');
const usersRef = database.ref('/users');

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

export const recordExternalPayment = (event, user, type, item) => registrationsRef
  .child(event.eventId)
  .child(user.uid)
  .child("external_payment")
  .child(item)
  .update({
    type,
    timestamp: firebase.database.ServerValue.TIMESTAMP
  });

export const sendAdminEmail = (subject, text, toEmail) => {
  window.Rollbar.info('Sending admin email', {subject, text});
  return axios.post(config.API_BASE_URL + 'adminEmail', {
    subject,
    text
  });
};

export const sendTemplateEmail = (subject, templateName, toEmail, fromEmail, substitutions) => {
  window.Rollbar.info('Sending template email', {subject, templateName, toEmail, fromEmail, substitutions});
  return axios.post(config.API_BASE_URL + 'templateEmail', {
    subject,
    template: templateName,
    to: toEmail,
    from: fromEmail,
    substitutions
  });
};

export const fetchImportedProfile = (email) => {
  return auth.currentUser.getIdToken().then(idToken =>
    axios.get(encodeURI(`${config.API_BASE_URL}importedProfile?idToken=${idToken}&email=${email}`))
  ).then((response) => response.data);
};

export const fetchAdminData = (eventId) => {
  return Promise.all([
    registrationsRef.child(eventId).once('value'),
    usersRef.once('value')
  ]).then(([registrationsSnapshot, usersSnapshot]) => {
    let registrations = registrationsSnapshot.val(),
        users = usersSnapshot.val();
    return Object.keys(registrations)
      .map((key) => ({
        registration: registrations[key],
        user: users[key]
      }));
  });
};

export const initServer = () => {
  return axios.post(config.API_BASE_URL + 'init');
};

export const fetchUserData = (uid) => {
  let userRef = usersRef.child(uid);
  return userRef.once("value")
    .then(snapshot => snapshot.val());
};

export const updateUserData = (uid, data) => {
  let userRef = usersRef.child(uid);
  return userRef.update(data);
};

export const updateUserProfile = (uid, eventId, profile, personalInfo) => {
  let profileRef = usersRef.child(uid).child('profile');
  let registrationRef = registrationsRef.child(eventId).child(uid);
  let personalInfoRef = registrationRef.child('personal');
  return Promise.all([
    profileRef.update(profile),
    personalInfoRef.update(personalInfo)
  ]);
};

export const updateRegistrationCart = (eventId, uid, values) => {
  let registrationRef = registrationsRef.child(eventId).child(uid);
  let cartRef = registrationRef.child('cart');
  return cartRef.update(values);
};

export const updateScholarshipApplication = (eventId, uid, values) => {
  let registrationRef = registrationsRef.child(eventId).child(uid);
  let scholarshipRef = registrationRef.child('scholarship');
  return scholarshipRef.set(values);
};

export const updateRegistrationOrder = (eventid, userid, values) => {
  window.Rollbar.info('Updating order:', {eventid, userid, values});
  return auth.currentUser.getIdToken().then(idToken =>
    axios.post(config.API_BASE_URL + 'updateOrder', {
      eventid,
      userid,
      values,
      idToken
    })
  );
};

export const fetchBamBam = (eventid, userid) => {
  return auth.currentUser.getIdToken().then(idToken =>
    axios.get(encodeURI(`${config.API_BASE_URL}bambam?idToken=${idToken}&eventid=${eventid}&userid=${userid}`))
  ).then((response) => response.data);
};

export const postBambamEmails = (eventid, userid, emails) => {
  return auth.currentUser.getIdToken().then(idToken =>
    axios.post(config.API_BASE_URL + 'bambam', {
      eventid,
      userid,
      idToken,
      emails
    })
  ).then((response) => response.data);
};
