import firebase from 'firebase';

// Initialize Firebase
var config = {
  apiKey: "AIzaSyBqtKHoRTf4sNXWuUtnS_SIKDiurLEAQMc",
  authDomain: "jmr-register.firebaseapp.com",
  databaseURL: "https://jmr-register.firebaseio.com",
  projectId: "jmr-register",
  storageBucket: "",
  messagingSenderId: "960329275142"
};
firebase.initializeApp(config);

export default firebase;
export const database = firebase.database();
export const auth = firebase.auth();
