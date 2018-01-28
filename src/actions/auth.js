import { database, auth } from '../firebase';
import pick from 'lodash/pick';
import { SIGN_IN, SIGN_OUT } from '../constants';
import { setApplicationError, clearApplicationError } from './application';
import { loadRegistration } from './registration';

const usersRef = database.ref('/users');

export const signInWithCredentials = (email, password) => {
  return (dispatch) => {
    console.log('signInWithCredentials: signing in');
    auth.signInWithEmailAndPassword(email, password).then(() => {
      console.log('signInWithCredentials: signed in');
      dispatch(clearApplicationError());
    }).catch(err => {
      dispatch(setApplicationError(`signIn error: (${err.code}) ${err.message}`, err.message));
    });
  }
}

export const createAccount = (email, password) => {
  return (dispatch) => {
    auth.createUserWithEmailAndPassword(email, password).then(() => {
      dispatch(clearApplicationError());
    }).catch(err => {
      dispatch(setApplicationError(`signUp error: (${err.code}) ${err.message}`, err.message));
    });
  }
}

export const signOut = () => {
  return (dispatch) => {
    auth.signOut();
    dispatch(clearApplicationError());
  }
}

const signedIn = (user) => {
  return {
    type: SIGN_IN,
    email: user.email,
    uid: user.uid
  };
};

export const signedOut = () => {
  return {
    type: SIGN_OUT
  };
};

export const startListeningToAuthChanges = (store) => {
  return (dispatch) => {
    return auth.onAuthStateChanged(user => {
      if (user) {
        console.log("user has signed in");
        usersRef.child(user.uid).set(pick(user, ['email', 'uid']));
        dispatch(signedIn(user));
        const state = store.getState();
        dispatch(loadRegistration(state.application.currentEvent, state.auth.currentUser));
      } else {
        dispatch(signedOut());
      }
    });
  };
};
