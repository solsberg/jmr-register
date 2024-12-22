import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';
import config from './config';

// Initialize Firebase
var firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: `${config.FIREBASE_PROJECT_ID}.firebaseapp.com`,
  databaseURL: `https://${config.FIREBASE_PROJECT_ID}.firebaseio.com`,
  projectId: `${config.FIREBASE_PROJECT_ID}`
};
const app = initializeApp(firebaseConfig);

// export default firebase;
export const database = getDatabase(app);
export const auth = getAuth(app);
setPersistence(auth, browserSessionPersistence);
