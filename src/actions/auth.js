import { database, auth } from '../firebase';
import pick from 'lodash/pick';
import { SIGN_IN, SIGN_OUT } from '../constants';
import { setApplicationError, clearApplicationError } from './application';

const usersRef = database.ref('/users');

export const signInWithCredentials = (email, password) => {
  return (dispatch) => {
    auth.signInWithEmailAndPassword(email, password).then(() => {
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

export const startListeningToAuthChanges = () => {
  return (dispatch) => {
    return auth.onAuthStateChanged(user => {
      if (user) {
        usersRef.child(user.uid).set(pick(user, ['email', 'uid']));
        dispatch(signedIn(user));
      } else {
        dispatch(signedOut());
      }
    });
  };
};
