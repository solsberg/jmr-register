import { ref, get, child, update, serverTimestamp } from "firebase/database";
import { database, auth } from '../firebase';
import axios from 'axios';
import config from '../config';
import toPairs from 'lodash/toPairs';

const eventsRef = ref(database, '/events');
const registrationsRef = ref(database, '/event-registrations');
const usersRef = ref(database, '/users');

export const fetchEvents = () => {
  return new Promise((resolve, reject) => {
    get(eventsRef).then(snapshot => {
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
    get(child(registrationsRef, `${event.eventId}/${user.uid}`)).then(snapshot => {
      resolve(snapshot.val());
    })
    .catch(err => {
      reject(err);
    });
  });
};

export const recordExternalPayment = (event, user, type, item) =>
  update(child(registrationsRef, `${event.eventId}/${user.uid}/external_payment/${item}`), {
    type,
    timestamp: serverTimestamp()
  });

export const sendAdminEmail = (subject, text, toEmail) => {
  // window.Rollbar.info('Sending admin email', {subject, text});
  return axios.post(config.API_BASE_URL + 'adminEmail', {
    subject,
    text
  });
};

export const sendTemplateEmail = (subject, templateName, toEmail, fromEmail, substitutions) => {
  // window.Rollbar.info('Sending template email', {subject, templateName, toEmail, fromEmail, substitutions});
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
    get(child(registrationsRef, eventId)),
    get(usersRef)
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
  let userRef = child(usersRef, uid);
  return get(userRef)
    .then(snapshot => snapshot.val());
};

export const updateUserData = (uid, data) => {
  let userRef = child(usersRef, uid);
  return update(userRef, data);
};

export const updateUserProfile = (uid, eventId, profile, personalInfo) => {
  let profileRef = child(usersRef, `${uid}/profile`);
  let registrationRef = child(registrationsRef, `${eventId}/${uid}`);
  let personalInfoRef = child(registrationRef, 'personal');
  return Promise.all([
    update(profileRef, profile),
    update(personalInfoRef, personalInfo)
  ]);
};

export const updateRegistrationCart = (eventId, uid, values) => {
  let registrationRef = child(registrationsRef, `${eventId}/${uid}`);
  let cartRef = child(registrationRef, 'cart');
  return update(cartRef, values);
};

export const updateScholarshipApplication = (eventId, uid, values) => {
  let registrationRef = child(registrationsRef, `${eventId}/${uid}`);
  let scholarshipRef = child(registrationRef, 'scholarship');
  return update(scholarshipRef, values);
};

export const updateRegistrationOrder = (eventid, userid, values) => {
  // window.Rollbar.info('Updating order:', {eventid, userid, values});
  return auth.currentUser.getIdToken().then(idToken =>
    axios.post(config.API_BASE_URL + 'updateOrder', {
      eventid,
      userid,
      values,
      idToken
    })
  );
};

export const fetchPromotions = (eventid, userid) => {
  return auth.currentUser.getIdToken().then(idToken =>
    axios.get(encodeURI(`${config.API_BASE_URL}promotions?idToken=${idToken}&eventid=${eventid}&userid=${userid}`))
  ).then((response) => response.data);
};

export const fetchRoomUpgradeStatus = (eventid) => {
  return axios.get(encodeURI(`${config.API_BASE_URL}roomUpgrade?eventid=${eventid}`))
  .then(response => response.data);
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

export const reconcileExternalPayment = (eventid, userid, amount, paymentDate, externalType) => {
  return auth.currentUser.getIdToken().then(idToken =>
    axios.post(config.API_BASE_URL + 'recordExternalPayment', {
      eventid,
      userid,
      idToken,
      amount,
      paymentDate,
      externalType
    })
  ).then((response) => response.data);
};

export const validateDiscountCode = (eventid, userid, code) => {
  return auth.currentUser.getIdToken().then(idToken =>
    axios.post(config.API_BASE_URL + 'validateCode', {
      eventid,
      userid,
      idToken,
      code
    })
  ).then(response => response.data);
};

export const createCheckoutSession = (eventid, userid, amount, isAdmin, paymentType) => {
  return auth.currentUser.getIdToken().then(idToken =>
    axios.post(config.API_BASE_URL + 'checkout', {
      eventid,
      userid,
      amountInCents: amount,
      isAdmin,
      paymentType,
      idToken
    })
  ).then(response => response.data);
};

export const cancelRegistration = (eventid, userid) => {
  return auth.currentUser.getIdToken().then(idToken =>
    axios.post(config.API_BASE_URL + 'cancelRegistration', {
      eventid,
      userid,
      idToken
    })
  ).then(response => response.data);
};
