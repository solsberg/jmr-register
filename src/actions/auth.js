import firebase, { database, auth } from '../firebase';
import pick from 'lodash/pick';
import { SIGN_IN, SIGN_OUT, GOOGLE_OAUTH_PROVIDER, FACEBOOK_OAUTH_PROVIDER } from '../constants';
import { setApplicationError, clearApplicationError } from './application';
import { loadRegistration } from './registration';
import { isMobile } from '../lib/utils';

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

export const signInWithOAuthProvider = (providerName) => {
  return (dispatch) => {
    console.log('signInWithOAuthProvider: show popup for ' + providerName);
    let provider;
    switch (providerName) {
      case GOOGLE_OAUTH_PROVIDER:
        provider = new firebase.auth.GoogleAuthProvider();
        break;
      case FACEBOOK_OAUTH_PROVIDER:
        provider = new firebase.auth.FacebookAuthProvider();
        break;
      default:
    }
    const authResult = isMobile() ? auth.signInWithRedirect(provider) : auth.signInWithPopup(provider);
    authResult.then(() => {
      console.log('signInWithOAuthProvider: signed in');
      dispatch(clearApplicationError());
    }).catch(err => {
      if (err.code !== 'auth/popup-closed-by-user') {
        dispatch(setApplicationError(`signIn error: (${err.code}) ${err.message}`, err.message));
      }
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

export const forgotPassword = (email) => {
  return (dispatch) => {
    console.log('forgotPassword: sending reset password email');
    auth.sendPasswordResetEmail(email).then(() => {
      console.log('forgotPassword: sent email');
      dispatch(clearApplicationError());
    }).catch(err => {
      let uiMessage;
      switch(err.code) {
        case 'auth/invalid-email':
          uiMessage = "Please enter a valid email address.";
          break;
        case 'auth/user-not-found':
          uiMessage = "There is no matching account with that email address."
          break;
        default:
          uiMessage = "There was an error trying to send the reset password email. " +
            "Please contact registration@menschwork.org for help";
            break;
      }
      dispatch(setApplicationError(`forgotPassword error: (${err.code}) ${err.message}`, uiMessage));
    });
  }
}

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
