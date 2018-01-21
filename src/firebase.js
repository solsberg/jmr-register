import firebase from 'firebase';
import config from './config';

// Initialize Firebase
var firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: `${config.FIREBASE_PROJECT_ID}.firebaseapp.com`,
  databaseURL: `https://${config.FIREBASE_PROJECT_ID}.firebaseio.com`,
  projectId: `${config.FIREBASE_PROJECT_ID}`
};
firebase.initializeApp(firebaseConfig);

export default firebase;
export const database = firebase.database();

export const auth = firebase.auth();
auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
